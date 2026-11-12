// AI-assisted: see docs/AI_LOG.md #23
import {
  collection, doc, query, where, orderBy, limit, startAfter,
  getDocs, onSnapshot, writeBatch,
  getAggregateFromServer, sum, count,
  // AI-assisted: see docs/AI_LOG.md #25
  addDoc, runTransaction,
} from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { assertTripAmounts } from '../utils/calculateFare'
import { GATEWAY_METHOD, CASH_METHOD } from '../utils/earningsSummary'
// AI-assisted: see docs/AI_LOG.md #25
import { isActiveTrip } from '../utils/tripStateMachine'
import { ACTIVE_STATUSES, PROTECTED_TRIP_FIELDS, WRITE_TIMEOUT_MS } from '../config/tripFlow'
import { DEFAULT_BASE_LOCATION } from '../utils/demoTrips'

// Acceso a Firestore de la colección "trips". Las marcas de tiempo son números (Date.now()).
// Al CERRAR un viaje, los montos (fare, commission, tip, driverEarnings) se guardan siempre como números enteros,
// calculados con buildTripAmounts: las agregaciones del saldo ignoran cualquier valor que no sea numérico.

const COLLECTION = 'trips'
// Estados que muestra el Historial
const HISTORY_STATUSES = ['completed', 'paid']
const DEFAULT_PAGE_SIZE = 20
// Tope de consultas seguidas al llenar una página cuando muchos viajes quedan fuera por su estado
const MAX_BATCHES_PER_PAGE = 10
// Firestore permite hasta 500 operaciones por lote; se deja margen
const BATCH_LIMIT = 400

const tripsRef = () => collection(db, COLLECTION)

const toTrip = (snap) => ({ id: snap.id, ...snap.data() })

// Si Firestore pide un índice, el mensaje del error trae el enlace para crearlo: se muestra en la consola de Metro
const logError = (source, error) => {
  if (__DEV__) console.warn(`[tripServices] ${source}:`, error?.message ?? error)
}

// Escucha en vivo los viajes del conductor cerrados desde sinceMs y entrega solo los pagados ('paid').
// No tiene tope de documentos: se acota por fecha (como mucho, el periodo más antiguo de Ganancias), así los totales no salen incompletos.
// Requiere un índice compuesto (driverId + completedAt). Devuelve la función para cancelar la suscripción
export const listenPaidTripsSince = (driverId, sinceMs, onChange, onError) => {
  const q = query(
    tripsRef(),
    where('driverId', '==', driverId),
    where('completedAt', '>=', sinceMs),
    orderBy('completedAt', 'desc')
  )
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map(toTrip).filter((trip) => trip.status === 'paid')),
    (error) => {
      logError('listenPaidTripsSince', error)
      onError?.(error)
    }
  )
}

// Una página del Historial, del más reciente al más antiguo por completedAt.
// cursor: último documento de la página anterior (null para la primera). Devuelve { trips, cursor, hasMore }.
// El filtro por estado (completed y paid) se hace en el cliente: si una consulta deja la página corta, se pide otra hasta llenarla.
// Requiere índices compuestos: driverId + completedAt, y driverId + paymentMethod + completedAt cuando se filtra por método
export async function fetchTripsPage(driverId, { from, to, paymentMethod = null, cursor = null, pageSize = DEFAULT_PAGE_SIZE }) {
  const buildQuery = (after) => {
    const constraints = [
      where('driverId', '==', driverId),
      where('completedAt', '>=', from),
      where('completedAt', '<=', to),
    ]
    if (paymentMethod) constraints.push(where('paymentMethod', '==', paymentMethod))
    constraints.push(orderBy('completedAt', 'desc'))
    if (after) constraints.push(startAfter(after))
    constraints.push(limit(pageSize))
    return query(tripsRef(), ...constraints)
  }

  const trips = []
  let lastDoc = cursor
  let hasMore = true

  try {
    for (let batch = 0; batch < MAX_BATCHES_PER_PAGE && trips.length < pageSize && hasMore; batch++) {
      const snap = await getDocs(buildQuery(lastDoc))
      let stoppedEarly = false

      for (let i = 0; i < snap.docs.length; i++) {
        lastDoc = snap.docs[i]
        if (HISTORY_STATUSES.includes(lastDoc.data().status)) trips.push(toTrip(lastDoc))
        // Página llena: lo que quede en este lote se leerá en la siguiente página
        if (trips.length >= pageSize) {
          stoppedEarly = i < snap.docs.length - 1
          break
        }
      }
      // Hay más si quedaron documentos sin procesar o si el lote vino lleno
      hasMore = stoppedEarly || snap.size === pageSize
    }
  } catch (error) {
    logError('fetchTripsPage', error)
    throw error
  }

  return { trips, cursor: lastDoc, hasMore }
}

// Saldo del conductor sobre TODOS sus viajes 'paid' (no sobre lo paginado), con agregaciones del servidor:
//   saldo = ganancias de stripe - comisiones en efectivo.
// Son tres consultas en paralelo; si una falla, toda la función lanza error (nunca devuelve un total parcial).
// La tercera cuenta todos los viajes 'paid' para detectar descuadre (p. ej. un paymentMethod distinto de los dos).
// Las agregaciones solo funcionan en línea y no admiten listeners: hay que volver a llamarla para actualizar.
// Devuelve { balance, paidCount, coveredCount, mismatch }
export async function getTripsBalance(driverId) {
  const paid = () => [where('driverId', '==', driverId), where('status', '==', 'paid')]
  const byMethod = (method) => query(tripsRef(), ...paid(), where('paymentMethod', '==', method))

  try {
    // AI-assisted: see docs/AI_LOG.md #29
    const [gateway, cash, all] = await Promise.all([
      getAggregateFromServer(byMethod(GATEWAY_METHOD), { earnings: sum('driverEarnings'), trips: count() }),
      getAggregateFromServer(byMethod(CASH_METHOD), { commissions: sum('commission'), trips: count() }),
      getAggregateFromServer(query(tripsRef(), ...paid()), { trips: count() }),
    ])

    const gatewayData = gateway.data()
    const cashData = cash.data()
    const paidCount = all.data().trips
    const coveredCount = gatewayData.trips + cashData.trips

    return {
      balance: gatewayData.earnings - cashData.commissions,
      paidCount,
      coveredCount,
      mismatch: paidCount !== coveredCount,
    }
  } catch (error) {
    logError('getTripsBalance', error)
    throw error
  }
}

// ---------- Solo desarrollo: viajes de ejemplo ----------

// Guarda los viajes de ejemplo en un solo lote, todos con isDemo: true.
// Antes de escribir comprueba que los montos sean números enteros que cuadran
export async function addDemoTrips(driverId, trips) {
  if (trips.length > BATCH_LIMIT) throw new RangeError('addDemoTrips: demasiados viajes para un solo lote')
  trips.forEach(assertTripAmounts)

  const batch = writeBatch(db)
  trips.forEach((trip) => {
    batch.set(doc(tripsRef()), { ...trip, driverId, isDemo: true })
  })
  await batch.commit()
  return trips.length
}

// Borra solo los viajes del conductor marcados con isDemo === true; nunca toca los reales. Devuelve cuántos borró
export async function removeDemoTrips(driverId) {
  const snap = await getDocs(query(tripsRef(), where('driverId', '==', driverId), where('isDemo', '==', true)))
  const demoDocs = snap.docs.filter((d) => d.data().isDemo === true)

  for (let i = 0; i < demoDocs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    demoDocs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  return demoDocs.length
}

// ---------- Flujo del viaje (fase B) ----------
// AI-assisted: see docs/AI_LOG.md #25

// Escucha en vivo las solicitudes que le llegan al conductor: viajes suyos con status 'requested', la más antigua primero.
// Solo usa filtros de igualdad (no pide índice compuesto) y ordena en el cliente por createdAt.
// Devuelve la función para cancelar la suscripción
export const listenTripRequests = (driverId, onChange, onError) => {
  const q = query(tripsRef(), where('driverId', '==', driverId), where('status', '==', 'requested'))
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map(toTrip).sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))),
    (error) => {
      logError('listenTripRequests', error)
      onError?.(error)
    }
  )
}

// Escucha en vivo un viaje. Entrega el viaje, o null si no existe. Devuelve la función para cancelar la suscripción
export const listenTrip = (tripId, onChange, onError) =>
  onSnapshot(
    doc(db, COLLECTION, tripId),
    (snap) => onChange(snap.exists() ? toTrip(snap) : null),
    (error) => {
      logError('listenTrip', error)
      onError?.(error)
    }
  )

// Busca el viaje que el conductor tiene en curso (para retomarlo al reabrir la app): accepted, driver_arriving o in_progress,
// o completed en efectivo sin cobrar. Una consulta por estado, solo con igualdades, para no exigir índices compuestos.
// Si hubiera más de uno, devuelve el más reciente. Devuelve null si no hay ninguno
export async function findActiveTrip(driverId) {
  try {
    const byStatus = (status, extra = []) =>
      getDocs(query(tripsRef(), where('driverId', '==', driverId), where('status', '==', status), ...extra))
    const snaps = await Promise.all([
      ...ACTIVE_STATUSES.map((status) => byStatus(status)),
      byStatus('completed', [where('paymentMethod', '==', CASH_METHOD)]),
    ])
    const trips = snaps.flatMap((snap) => snap.docs.map(toTrip)).filter(isActiveTrip)
    trips.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    return trips[0] ?? null
  } catch (error) {
    logError('findActiveTrip', error)
    throw error
  }
}

// Campos que una transición puede escribir. Cualquier otro (y los protegidos) se rechaza antes de tocar Firestore
const TRANSITION_FIELDS = [
  'status', 'updatedAt', 'acceptedAt', 'arrivingAt', 'startedAt', 'completedAt', 'paidAt',
  'rejectedAt', 'rejectedBy', 'rejectedReason', 'cancelledAt', 'cancelledBy',
  'distanceKm', 'durationMin', 'fare', 'commission', 'tip', 'driverEarnings', 'commissionRate',
  'route', 'paymentStatus', 'paymentId',
]

// Error de una transición. code: 'invalid_fields' | 'not_found' | 'not_yours' | 'unavailable' | 'timeout' | 'failed'
export class TripTransitionError extends Error {
  constructor(code, message) {
    super(message ?? code)
    this.name = 'TripTransitionError'
    this.code = code
  }
}

// Cambia el estado de un viaje con una transacción: solo escribe si el viaje es del conductor y sigue en uno de los
// estados esperados (expectedFrom). Así nunca se pisa un cambio del pasajero (por ejemplo, una solicitud ya cancelada).
// Resuelve con el viaje actualizado. Las transacciones fallan sin conexión; además se corta la espera a los timeoutMs,
// porque sin red Firestore no falla sino que queda esperando. Si vence el tiempo, el listener del viaje corrige cualquier
// diferencia que quede si la transacción llegara a completarse después.
export async function transitionTrip(tripId, driverId, expectedFrom, fields, { timeoutMs = WRITE_TIMEOUT_MS } = {}) {
  const keys = Object.keys(fields ?? {})
  const invalid = keys.filter((key) => !TRANSITION_FIELDS.includes(key) || PROTECTED_TRIP_FIELDS.includes(key))
  if (!tripId || !driverId || !Array.isArray(expectedFrom) || expectedFrom.length === 0 || keys.length === 0 || invalid.length > 0) {
    throw new TripTransitionError('invalid_fields', `transitionTrip: campos no permitidos (${invalid.join(', ') || 'ninguno válido'})`)
  }

  const ref = doc(db, COLLECTION, tripId)
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TripTransitionError('timeout', 'Tiempo de espera agotado al actualizar el viaje')), timeoutMs)
  })

  const transaction = runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new TripTransitionError('not_found')
    const data = snap.data()
    if (data.driverId !== driverId) throw new TripTransitionError('not_yours')
    if (!expectedFrom.includes(data.status)) {
      throw new TripTransitionError('unavailable', `El viaje está en ${data.status}`)
    }
    tx.update(ref, fields)
    return { id: snap.id, ...data, ...fields }
  })

  try {
    return await Promise.race([transaction, timeout])
  } catch (error) {
    if (error instanceof TripTransitionError) {
      if (error.code !== 'timeout') logError('transitionTrip', error)
      throw error
    }
    logError('transitionTrip', error)
    throw new TripTransitionError('failed', error?.message)
  } finally {
    clearTimeout(timer)
    // Si ganó el tiempo de espera, un fallo tardío de la transacción no debe quedar sin atender
    transaction.catch(() => {})
  }
}

// ---------- Solo desarrollo: solicitudes de ejemplo ----------

const DEMO_CATEGORIES = ['economy', 'xl', 'premium']
const DEMO_PAYMENT_METHODS = ['cash', 'stripe']
const DEMO_ADDRESSES = [
  'Calle 5 # 38-20 (ejemplo)', 'Carrera 100 # 14-30 (ejemplo)', 'Avenida 6N # 25-10 (ejemplo)',
  'Calle 9 # 24-50 (ejemplo)', 'Carrera 1 # 62-40 (ejemplo)', 'Avenida Roosevelt # 23-15 (ejemplo)',
]
const KM_PER_DEGREE = 111.32

// Arma una solicitud de ejemplo: recogida a ~1 km del conductor y destino a unos 3 a 6 km, con distancia y duración
// calculadas localmente (sin llamar al proveedor de rutas), como las traería la app del pasajero. random permite probarla
export function buildDemoRequest({ driverId, base = null, category = 'economy', paymentMethod = 'cash', now = Date.now(), random = Math.random }) {
  const center = base && Number.isFinite(base.lat) && Number.isFinite(base.lng) ? base : DEFAULT_BASE_LOCATION
  const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback)

  const origin = { lat: center.lat + (random() - 0.5) * 0.02, lng: center.lng + (random() - 0.5) * 0.02 }
  // Destino a 0.03 a 0.055 grados de distancia, en una dirección aleatoria
  const angle = random() * 2 * Math.PI
  const spread = 0.03 + random() * 0.025
  const destination = { lat: origin.lat + Math.sin(angle) * spread, lng: origin.lng + Math.cos(angle) * spread }

  // Distancia aproximada en línea recta; la ruta real es más larga
  const dLat = (destination.lat - origin.lat) * KM_PER_DEGREE
  const dLng = (destination.lng - origin.lng) * KM_PER_DEGREE * Math.cos((origin.lat * Math.PI) / 180)
  const distanceKm = Math.max(1, Math.round(Math.sqrt(dLat ** 2 + dLng ** 2) * 1.3 * 10) / 10)
  const durationMin = Math.max(4, Math.round(distanceKm / 0.45))

  const addressIndex = Math.floor(random() * DEMO_ADDRESSES.length)
  return {
    driverId,
    passengerId: 'demo-passenger-request',
    status: 'requested',
    origin: { ...origin, address: DEMO_ADDRESSES[addressIndex] },
    destination: { ...destination, address: DEMO_ADDRESSES[(addressIndex + 3) % DEMO_ADDRESSES.length] },
    category: pick(category, DEMO_CATEGORIES, 'economy'),
    paymentMethod: pick(paymentMethod, DEMO_PAYMENT_METHODS, 'cash'),
    distanceKm,
    durationMin,
    tip: 0,
    createdAt: now,
    isDemo: true,
  }
}

// Crea una solicitud de ejemplo para el conductor y devuelve su id. La borra removeDemoTrips (isDemo: true)
export async function createDemoRequest(driverId, options = {}) {
  const ref = await addDoc(tripsRef(), buildDemoRequest({ driverId, ...options }))
  return ref.id
}

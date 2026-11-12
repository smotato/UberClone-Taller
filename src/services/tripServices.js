// AI-assisted: see docs/AI_LOG.md #23
import {
  collection, doc, query, where, orderBy, limit, startAfter,
  getDocs, onSnapshot, writeBatch,
  getAggregateFromServer, sum, count,
} from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { assertTripAmounts } from '../utils/calculateFare'
import { GATEWAY_METHODS, CASH_METHOD } from '../utils/earningsSummary'

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
//   saldo = ganancias de mercadopago + ganancias de stripe - comisiones en efectivo.
// Son cuatro consultas en paralelo; si una falla, toda la función lanza error (nunca devuelve un total parcial).
// La cuarta cuenta todos los viajes 'paid' para detectar descuadre (p. ej. un paymentMethod distinto de los tres).
// Las agregaciones solo funcionan en línea y no admiten listeners: hay que volver a llamarla para actualizar.
// Devuelve { balance, paidCount, coveredCount, mismatch }
export async function getTripsBalance(driverId) {
  const paid = () => [where('driverId', '==', driverId), where('status', '==', 'paid')]
  const byMethod = (method) => query(tripsRef(), ...paid(), where('paymentMethod', '==', method))
  const [method1, method2] = GATEWAY_METHODS

  try {
    const [first, second, cash, all] = await Promise.all([
      getAggregateFromServer(byMethod(method1), { earnings: sum('driverEarnings'), trips: count() }),
      getAggregateFromServer(byMethod(method2), { earnings: sum('driverEarnings'), trips: count() }),
      getAggregateFromServer(byMethod(CASH_METHOD), { commissions: sum('commission'), trips: count() }),
      getAggregateFromServer(query(tripsRef(), ...paid()), { trips: count() }),
    ])

    const firstData = first.data()
    const secondData = second.data()
    const cashData = cash.data()
    const paidCount = all.data().trips
    const coveredCount = firstData.trips + secondData.trips + cashData.trips

    return {
      balance: firstData.earnings + secondData.earnings - cashData.commissions,
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

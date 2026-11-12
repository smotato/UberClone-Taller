// AI-assisted: see docs/AI_LOG.md #25
import { buildTripAmounts, assertTripAmounts } from './calculateFare'
import { encodePolyline } from './polyline'
import { ACTIVE_STATUSES, REJECT_REASONS, PROTECTED_TRIP_FIELDS } from '../config/tripFlow'

// Funciones puras (sin React ni Firebase) con las reglas del viaje: qué estados pueden seguir a cuáles,
// qué campos escribe cada transición y qué pantalla corresponde a cada estado.

export const TRIP_STATUS = {
  requested: 'requested',
  accepted: 'accepted',
  driverArriving: 'driver_arriving',
  inProgress: 'in_progress',
  completed: 'completed',
  paid: 'paid',
  rejected: 'rejected',
  cancelled: 'cancelled',
}

// Cambios de estado válidos. 'paid', 'rejected' y 'cancelled' son finales
const TRANSITIONS = {
  requested: ['accepted', 'rejected'],
  accepted: ['driver_arriving', 'cancelled'],
  driver_arriving: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: ['paid'],
  paid: [],
  rejected: [],
  cancelled: [],
}

// Indica si el estado 'from' puede pasar al estado 'to'. Un estado igual a sí mismo no es un cambio de estado
export const canTransition = (from, to) => (TRANSITIONS[from] ?? []).includes(to)

// Un viaje está activo mientras el conductor debe atenderlo: en curso, o terminado en efectivo sin cobrar
export const isActiveTrip = (trip) =>
  Boolean(trip) &&
  (ACTIVE_STATUSES.includes(trip.status) || (trip.status === TRIP_STATUS.completed && trip.paymentMethod === 'cash'))

// Elige la distancia y la duración finales: las del tramo recogida -> destino de Directions si existen;
// si no, las de la solicitud. No se usa el tiempo transcurrido real, para que las pruebas cortas no den siempre la tarifa mínima
export function pickFinalMetrics(trip, destinationLeg = null) {
  const valid = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0
  if (destinationLeg && valid(destinationLeg.distanceKm) && valid(destinationLeg.durationMin)) {
    return { distanceKm: destinationLeg.distanceKm, durationMin: destinationLeg.durationMin }
  }
  if (valid(trip?.distanceKm) && valid(trip?.durationMin)) {
    return { distanceKm: trip.distanceKm, durationMin: trip.durationMin }
  }
  throw new RangeError('pickFinalMetrics: el viaje no tiene distancia ni duración')
}

// La propina es opcional: solo cuenta si es un entero mayor o igual a 0
const safeTip = (tip) => (Number.isInteger(tip) && tip >= 0 ? tip : 0)

// Construye lo que debe escribir una transición.
// action: 'accept' | 'reject' | 'startArriving' | 'passengerOnBoard' | 'finish' | 'collectCash' | 'cancel'
//         | 'gatewayApproved' | 'gatewayRejected' (estas dos son solo para desarrollo)
// context: { driverId, reason, trip, destinationLeg, routePoints, paymentId, metrics }
// (metrics: { distanceKm, durationMin } estimados al aceptar, cuando la solicitud no los traía; así sobreviven si se cierra la app)
// Devuelve { expectedFrom, to, fields }: el estado en que debe estar el viaje, el estado nuevo y los campos (con updatedAt)
export function buildPatch(action, context = {}, now = Date.now()) {
  const { driverId, reason, trip, destinationLeg, routePoints, paymentId, metrics } = context

  const result = (expectedFrom, to, fields) => {
    expectedFrom.forEach((from) => {
      if (to !== from && !canTransition(from, to)) {
        throw new RangeError(`buildPatch: transición no permitida de ${from} a ${to}`)
      }
    })
    const patch = { expectedFrom, to, fields: { status: to, ...fields, updatedAt: now } }
    // Seguro extra: ninguna transición puede tocar los campos protegidos
    PROTECTED_TRIP_FIELDS.forEach((field) => {
      if (field in patch.fields) throw new RangeError(`buildPatch: el campo ${field} está protegido`)
    })
    return patch
  }

  switch (action) {
    case 'accept': {
      const validMetrics = metrics &&
        Number.isFinite(metrics.distanceKm) && metrics.distanceKm >= 0 &&
        Number.isFinite(metrics.durationMin) && metrics.durationMin >= 0
      return result(['requested'], 'accepted', {
        acceptedAt: now,
        ...(validMetrics ? { distanceKm: metrics.distanceKm, durationMin: metrics.durationMin } : {}),
      })
    }

    case 'reject':
      if (!REJECT_REASONS.includes(reason)) throw new RangeError(`buildPatch: motivo de rechazo inválido "${reason}"`)
      if (!driverId) throw new RangeError('buildPatch: falta driverId')
      return result(['requested'], 'rejected', { rejectedAt: now, rejectedBy: driverId, rejectedReason: reason })

    case 'startArriving':
      return result(['accepted'], 'driver_arriving', { arrivingAt: now })

    case 'passengerOnBoard':
      return result(['driver_arriving'], 'in_progress', { startedAt: now })

    case 'finish': {
      if (!trip) throw new RangeError('buildPatch: falta el viaje')
      const { distanceKm, durationMin } = pickFinalMetrics(trip, destinationLeg)
      const amounts = buildTripAmounts({ distanceKm, durationMin, category: trip.category, tip: safeTip(trip.tip) })
      assertTripAmounts(amounts)
      // Ruta guardada: máximo 100 puntos; sin puntos queda null (el detalle del Historial la soporta)
      const route = encodePolyline(routePoints ?? []) || null
      return result(['in_progress'], 'completed', {
        completedAt: now,
        distanceKm,
        durationMin,
        ...amounts,
        route,
        paymentStatus: 'pending',
      })
    }

    case 'collectCash':
      if (trip?.paymentMethod !== 'cash') throw new RangeError('buildPatch: solo un viaje en efectivo se cobra así')
      return result(['completed'], 'paid', { paidAt: now, paymentStatus: 'cash' })

    case 'cancel':
      return result(['accepted', 'driver_arriving'], 'cancelled', { cancelledAt: now, cancelledBy: 'driver' })

    case 'gatewayApproved':
      if (!trip || trip.paymentMethod === 'cash') throw new RangeError('buildPatch: la pasarela no aplica al efectivo')
      return result(['completed'], 'paid', { paidAt: now, paymentStatus: 'approved', paymentId: paymentId ?? `dev-${now}` })

    case 'gatewayRejected':
      if (!trip || trip.paymentMethod === 'cash') throw new RangeError('buildPatch: la pasarela no aplica al efectivo')
      // El viaje sigue en 'completed': solo cambia el estado del pago
      return result(['completed'], 'completed', { paymentStatus: 'rejected' })

    default:
      throw new RangeError(`buildPatch: acción desconocida "${action}"`)
  }
}

// Pantalla que corresponde al estado actual: 'IncomingRequest' | 'TripInProgress' | 'TripSummary' | null.
// Un viaje activo manda sobre una solicitud nueva. Los viajes rechazados o cancelados no tienen pantalla
export function screenForTrip(trip, request = null) {
  if (trip) {
    if (ACTIVE_STATUSES.includes(trip.status)) return 'TripInProgress'
    if (trip.status === TRIP_STATUS.completed || trip.status === TRIP_STATUS.paid) return 'TripSummary'
    return null
  }
  return request ? 'IncomingRequest' : null
}

// AI-assisted: see docs/AI_LOG.md #29
import { toMinorUnits, CURRENCY } from './stripeClient.js'
import { TripStateError } from './tripsStore.js'

// Casos de uso del cobro con tarjeta: crear el cobro y confirmarlo. Son funciones puras en el sentido de que reciben
// sus dependencias (viajes, Stripe y reloj), así se prueban con simulaciones sin tocar Firestore ni Stripe.
//
// Reglas de seguridad:
//  - El monto SIEMPRE sale del viaje en Firestore (trip.fare), nunca de lo que mande el celular.
//  - La app nunca dice si el pago fue aprobado: el servidor se lo pregunta a Stripe y comprueba que el cobro
//    sea de ese viaje, por ese monto y en esa moneda.

// Códigos de error y el estado HTTP con el que responde el servidor
export const ERROR_STATUS = {
  invalid_request: 400,
  trip_not_found: 404,
  not_payable: 409,
  already_paid: 409,
  payment_mismatch: 409,
  provider_error: 502,
  store_error: 502,
}

export class PaymentError extends Error {
  constructor(code, details = {}) {
    super(code)
    this.name = 'PaymentError'
    this.code = code
    this.details = details
  }
}

const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/
const ATTEMPT_PATTERN = /^[A-Za-z0-9_-]{8,64}$/
const INTENT_PATTERN = /^pi_[A-Za-z0-9]{8,128}$/
// Tope razonable de una tarifa (también cabe de sobra en el límite de Stripe para COP)
const MAX_FARE = 99999999

const isPayableAmount = (fare) => Number.isInteger(fare) && fare > 0 && fare <= MAX_FARE

export function createPayments({ trips, gateway, now = Date.now }) {
  // Lee el viaje y comprueba que se pueda cobrar con tarjeta
  async function loadPayableTrip(tripId) {
    const trip = await trips.get(tripId)
    if (!trip) throw new PaymentError('trip_not_found')
    if (trip.status === 'paid') throw new PaymentError('already_paid', { paymentId: trip.paymentId ?? null })
    if (trip.status !== 'completed' || trip.paymentMethod !== 'stripe' || !isPayableAmount(trip.fare)) {
      throw new PaymentError('not_payable')
    }
    return trip
  }

  return {
    // Paso 1: prepara el cobro del viaje y devuelve el client_secret para el PaymentSheet de la app
    async createCardPayment({ tripId, attemptId }) {
      if (typeof tripId !== 'string' || !ID_PATTERN.test(tripId) || typeof attemptId !== 'string' || !ATTEMPT_PATTERN.test(attemptId)) {
        throw new PaymentError('invalid_request')
      }
      const trip = await loadPayableTrip(tripId)

      try {
        const intent = await gateway.createIntent({
          amount: toMinorUnits(trip.fare),
          tripId,
          idempotencyKey: `trip-${tripId}-${attemptId}`,
        })
        return { clientSecret: intent.clientSecret, paymentIntentId: intent.id }
      } catch {
        throw new PaymentError('provider_error')
      }
    },

    // Paso 2: consulta el cobro a Stripe, comprueba que sea de este viaje y actualiza el viaje según el resultado
    async confirmCardPayment({ tripId, paymentIntentId }) {
      if (typeof tripId !== 'string' || !ID_PATTERN.test(tripId) || typeof paymentIntentId !== 'string' || !INTENT_PATTERN.test(paymentIntentId)) {
        throw new PaymentError('invalid_request')
      }

      const trip = await trips.get(tripId)
      if (!trip) throw new PaymentError('trip_not_found')
      // Ya pagado: se devuelve el resultado anterior sin tocar nada (confirmar dos veces es seguro)
      if (trip.status === 'paid') return { status: 'approved', paymentId: trip.paymentId ?? null }
      if (trip.status !== 'completed' || trip.paymentMethod !== 'stripe' || !isPayableAmount(trip.fare)) {
        throw new PaymentError('not_payable')
      }

      let intent
      try {
        intent = await gateway.retrieveIntent(paymentIntentId)
      } catch {
        throw new PaymentError('provider_error')
      }

      // El cobro debe ser de este viaje, por el monto del viaje y en pesos colombianos
      if (intent.metadata?.tripId !== tripId || intent.amount !== toMinorUnits(trip.fare) || intent.currency !== CURRENCY) {
        throw new PaymentError('payment_mismatch')
      }

      const timestamp = now()
      try {
        if (intent.status === 'succeeded') {
          await trips.applyResult(tripId, {
            status: 'paid',
            paymentStatus: 'approved',
            paymentId: intent.id,
            paidAt: timestamp,
            updatedAt: timestamp,
          })
          return { status: 'approved', paymentId: intent.id }
        }

        // Una tarjeta rechazada deja el cobro en requires_payment_method con su último error de pago
        if (intent.status === 'requires_payment_method' && intent.lastError) {
          const detail = intent.lastError.declineCode ?? intent.lastError.code ?? 'declined'
          await trips.applyResult(tripId, {
            paymentStatus: 'rejected',
            paymentStatusDetail: detail,
            updatedAt: timestamp,
          })
          return { status: 'rejected', detail }
        }
      } catch (error) {
        // El viaje cambió mientras tanto (por ejemplo, otra confirmación lo dejó pagado)
        if (error instanceof TripStateError) {
          if (error.status === 'paid') {
            const current = await trips.get(tripId)
            return { status: 'approved', paymentId: current?.paymentId ?? null }
          }
          throw new PaymentError('not_payable')
        }
        // No se pudo escribir en Firestore (sin red, reglas, etc.)
        throw new PaymentError('store_error')
      }

      // Cualquier otro estado (sin intento de pago, procesando, requiere acción): no se cambia el viaje
      return { status: 'pending' }
    },
  }
}

// AI-assisted: see docs/AI_LOG.md #29
import Stripe from 'stripe'

// Capa fina sobre Stripe: crear el PaymentIntent y consultarlo. Devuelve datos ya normalizados para que
// el resto del servidor no dependa de la forma exacta de la API de Stripe (y se pueda probar con un cliente simulado).

// COP tiene dos decimales en Stripe: el monto va en la unidad mínima (19.200 COP -> 1920000)
export const CURRENCY = 'cop'
export const toMinorUnits = (pesos) => pesos * 100

// Resumen de un error de pago de Stripe sin datos sensibles
const toLastError = (error) =>
  error
    ? { code: error.code ?? null, declineCode: error.decline_code ?? null, message: error.message ?? null }
    : null

// stripe: cliente de la librería oficial (o uno simulado con la misma forma, en las pruebas)
export function createStripeGateway(stripe) {
  return {
    // Crea el cobro del viaje, limitado a tarjetas. La versión actual de la API usa allowed_payment_method_types
    // (payment_method_types ya no existe). idempotencyKey evita crear dos cobros si la misma petición se repite
    async createIntent({ amount, tripId, idempotencyKey }) {
      const intent = await stripe.paymentIntents.create(
        {
          amount,
          currency: CURRENCY,
          allowed_payment_method_types: ['card'],
          metadata: { tripId },
        },
        { idempotencyKey }
      )
      return { id: intent.id, clientSecret: intent.client_secret }
    },

    // Consulta el estado real del cobro en Stripe
    async retrieveIntent(id) {
      const intent = await stripe.paymentIntents.retrieve(id)
      return {
        id: intent.id,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        metadata: intent.metadata ?? {},
        lastError: toLastError(intent.last_payment_error),
      }
    },
  }
}

// Cliente real de Stripe con la clave secreta de prueba
export const createStripe = (secretKey) => new Stripe(secretKey, { maxNetworkRetries: 1 })

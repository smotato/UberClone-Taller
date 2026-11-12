// AI-assisted: see docs/AI_LOG.md #29
// Único archivo de la app que habla con el servidor de pagos (carpeta server/). Nunca lanza errores:
// devuelve { ok: true, ...datos } o { ok: false, code }.

const API_URL = (process.env.EXPO_PUBLIC_PAYMENTS_API_URL ?? '').trim().replace(/\/+$/, '')
export const STRIPE_PUBLISHABLE_KEY = (process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '').trim()

// Espera máxima de cada petición
const REQUEST_TIMEOUT_MS = 20000

// Códigos que el servidor puede devolver y la app distingue; cualquier otro se trata como error del proveedor
const KNOWN_ERRORS = ['not_payable', 'already_paid', 'trip_not_found', 'provider_error']

// Hay dirección del servidor y llave publicable: sin ellas la app conserva la simulación de desarrollo
export const isPaymentsConfigured = Boolean(API_URL && STRIPE_PUBLISHABLE_KEY)

async function post(path, body) {
  if (!isPaymentsConfigured) return { ok: false, code: 'not_configured' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    let data = null
    try {
      data = await response.json()
    } catch {
      return { ok: false, code: 'invalid_response' }
    }
    if (!response.ok) {
      const code = typeof data?.error === 'string' && KNOWN_ERRORS.includes(data.error) ? data.error : 'provider_error'
      return { ok: false, code, paymentId: data?.paymentId ?? null }
    }
    return { ok: true, data }
  } catch (error) {
    return { ok: false, code: error?.name === 'AbortError' ? 'timeout' : 'unreachable' }
  } finally {
    clearTimeout(timer)
  }
}

// Paso 1: pide al servidor preparar el cobro del viaje. attemptId identifica este toque del botón
export async function createPaymentIntent(tripId, attemptId) {
  const result = await post('/payments/intent', { tripId, attemptId })
  if (!result.ok) return result
  const { clientSecret, paymentIntentId } = result.data ?? {}
  if (typeof clientSecret !== 'string' || typeof paymentIntentId !== 'string') return { ok: false, code: 'invalid_response' }
  return { ok: true, clientSecret, paymentIntentId }
}

// Paso 2: pide al servidor confirmar el resultado con Stripe. status: 'approved' | 'rejected' | 'pending'
export async function confirmPayment(tripId, paymentIntentId) {
  const result = await post('/payments/confirm', { tripId, paymentIntentId })
  if (!result.ok) return result
  const { status, paymentId, detail } = result.data ?? {}
  if (!['approved', 'rejected', 'pending'].includes(status)) return { ok: false, code: 'invalid_response' }
  return { ok: true, status, paymentId: paymentId ?? null, detail: detail ?? null }
}

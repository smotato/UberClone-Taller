// AI-assisted: see docs/AI_LOG.md #29
// Prueba de viabilidad del cobro con Stripe (punto de control 1 de PLAN_PAYMENT).
// Uso: copia server/.env.example a server/.env, escribe tu STRIPE_SECRET_KEY de PRUEBA (sk_test_...) y ejecuta
//   npm run probe        (desde la carpeta server)
// No toca la app ni Firestore. Solo crea PaymentIntents de prueba en tu cuenta de Stripe en modo de prueba.
// Nunca imprime la llave: cualquier texto que parezca una llave se oculta antes de mostrarse.
import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import Stripe from 'stripe'

// COP tiene dos decimales en Stripe: el monto va en la unidad mínima (19.200 COP -> 1920000)
const toMinorUnits = (cop) => cop * 100
const SAMPLE_AMOUNT = toMinorUnits(19200)
const MINIMUM_FARE_AMOUNT = toMinorUnits(6000)

// Formas de limitar el pago a tarjetas. El nombre del parámetro depende de la versión de la API de Stripe,
// así que se prueban en orden y se queda la primera que funcione
export const CARD_ONLY_VARIANTS = [
  { name: 'payment_method_types', params: { payment_method_types: ['card'] } },
  { name: 'allowed_payment_method_types', params: { allowed_payment_method_types: ['card'] } },
  {
    name: 'automatic_payment_methods sin redirecciones',
    params: { automatic_payment_methods: { enabled: true, allow_redirects: 'never' } },
  },
]

// Tarjetas de prueba de Stripe usadas desde el servidor (métodos de pago de prueba, sin números de tarjeta)
export const SCENARIOS = [
  { label: 'pago aprobado', paymentMethod: 'pm_card_visa', expect: 'succeeded' },
  { label: 'rechazo genérico', paymentMethod: 'pm_card_visa_chargeDeclined', expect: 'declined' },
  { label: 'fondos insuficientes', paymentMethod: 'pm_card_visa_chargeDeclinedInsufficientFunds', expect: 'declined' },
]

// Oculta cualquier texto con forma de llave de Stripe
export const redact = (text) =>
  String(text ?? '').replace(/\b(sk|rk|pk)_(test|live)_[A-Za-z0-9*_]+/g, '$1_$2_***')

// Resume un error de Stripe sin datos sensibles
export function describeError(error) {
  return {
    type: error?.type ?? null,
    code: error?.code ?? null,
    declineCode: error?.decline_code ?? error?.raw?.decline_code ?? null,
    statusCode: error?.statusCode ?? null,
    message: redact(error?.message ?? error),
  }
}

const onlyCard = (paymentIntent) => {
  const types = paymentIntent?.payment_method_types ?? []
  return types.length > 0 && types.every((type) => type === 'card' || type === 'link')
}

// Crea y confirma un PaymentIntent con un método de pago de prueba. Los rechazos pueden lanzar un error:
// en ese caso se recupera el PaymentIntent para ver su estado y su último error de pago
// El resultado se evalúa con la CONSULTA posterior del PaymentIntent (retrieve), que es justo lo que hará el backend
// al confirmar un pago; el error lanzado solo sirve para mostrar el motivo
async function confirmWithTestMethod(stripe, params, paymentMethod, amount) {
  let id = null
  let thrown = null
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'cop',
      confirm: true,
      payment_method: paymentMethod,
      metadata: { probe: 'true' },
      ...params,
    })
    id = paymentIntent.id
  } catch (error) {
    thrown = describeError(error)
    id = error?.payment_intent?.id ?? error?.raw?.payment_intent?.id ?? null
  }
  const retrieved = id ? await stripe.paymentIntents.retrieve(id).catch(() => null) : null
  return {
    status: retrieved?.status ?? null,
    lastError: retrieved?.last_payment_error ?? null,
    retrieved: Boolean(retrieved),
    thrown,
  }
}

// Ejecuta todas las comprobaciones con un cliente de Stripe. Devuelve { results, ok, findings }
export async function runProbe(stripe, log = console.log) {
  const results = []
  const findings = { country: null, defaultCurrency: null, copWorks: false, cardOnlyVariant: null }
  // optional: un intento que puede fallar sin que importe si otro funciona (por ejemplo, un nombre de parámetro que no existe)
  const record = (name, ok, detail, { optional = false } = {}) => {
    results.push({ name, ok, detail, optional })
    log(`${ok ? 'OK    ' : optional ? 'NO APLICA' : 'FALLÓ '} ${name}${detail ? ` — ${detail}` : ''}`)
  }

  // 1) La llave es válida y de qué país es la cuenta
  try {
    const account = await stripe.accounts.retrieve()
    findings.country = account?.country ?? null
    findings.defaultCurrency = account?.default_currency ?? null
    record(
      'Cuenta de Stripe',
      true,
      `país ${account?.country ?? '?'}, moneda por defecto ${account?.default_currency ?? '?'}, cobros ${account?.charges_enabled ? 'habilitados' : 'no habilitados'}`
    )
  } catch (error) {
    const e = describeError(error)
    record('Cuenta de Stripe', false, `${e.code ?? e.type ?? 'error'}: ${e.message}`)
  }

  // 2) PaymentIntent en COP, probando cómo limitarlo a tarjetas
  let firstWorking = null
  for (const variant of CARD_ONLY_VARIANTS) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: SAMPLE_AMOUNT,
        currency: 'cop',
        metadata: { probe: 'true' },
        ...variant.params,
      })
      const cardOnly = onlyCard(paymentIntent)
      record(
        `PaymentIntent en COP con ${variant.name}`,
        true,
        `estado ${paymentIntent.status}, monto ${paymentIntent.amount} ${paymentIntent.currency}, métodos [${(paymentIntent.payment_method_types ?? []).join(', ')}], client_secret ${paymentIntent.client_secret ? 'sí' : 'no'}`
      )
      await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {})
      findings.copWorks = true
      if (!firstWorking) firstWorking = variant
      if (cardOnly) {
        findings.cardOnlyVariant = variant.name
        break
      }
    } catch (error) {
      const e = describeError(error)
      record(`PaymentIntent en COP con ${variant.name}`, false, `${e.code ?? e.type ?? 'error'}: ${e.message}`, { optional: true })
    }
  }

  // Si COP no funcionó con ninguna variante, se comprueba con USD para saber si el problema es la moneda o la llave
  if (!findings.copWorks) {
    try {
      const usd = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'usd',
        metadata: { probe: 'true' },
        ...CARD_ONLY_VARIANTS[0].params,
      })
      await stripe.paymentIntents.cancel(usd.id).catch(() => {})
      record('Comprobación en USD', true, 'la llave funciona en USD; el problema es el cobro en COP')
    } catch (error) {
      const e = describeError(error)
      record('Comprobación en USD', false, `${e.code ?? e.type ?? 'error'}: ${e.message}`)
    }
  }

  // 3) Resultados de pago con las tarjetas de prueba (solo si hubo una forma de limitar a tarjetas)
  const variant = findings.cardOnlyVariant
    ? CARD_ONLY_VARIANTS.find((item) => item.name === findings.cardOnlyVariant)
    : firstWorking
  if (variant && findings.copWorks) {
    for (const scenario of SCENARIOS) {
      const outcome = await confirmWithTestMethod(stripe, variant.params, scenario.paymentMethod, MINIMUM_FARE_AMOUNT)
      const errorInfo = outcome.lastError
        ? `${outcome.lastError.code ?? '?'}${outcome.lastError.decline_code ? `/${outcome.lastError.decline_code}` : ''}`
        : outcome.thrown
          ? `${outcome.thrown.code ?? outcome.thrown.type ?? '?'}${outcome.thrown.declineCode ? `/${outcome.thrown.declineCode}` : ''}`
          : 'sin error'
      if (scenario.expect === 'succeeded') {
        record(`Tarjeta de prueba: ${scenario.label}`, outcome.status === 'succeeded', `estado ${outcome.status ?? '?'}`)
      } else {
        // Lo que necesita el backend: al consultar el PaymentIntent tras el rechazo, ver requires_payment_method + último error
        const detected = outcome.retrieved && outcome.status === 'requires_payment_method' && Boolean(outcome.lastError)
        record(
          `Tarjeta de prueba: ${scenario.label}`,
          detected,
          `al consultarlo: estado ${outcome.status ?? '?'}, error ${errorInfo}; el rechazo se detecta con last_payment_error: ${detected ? 'sí' : 'no'}`
        )
      }
    }
  } else {
    log('— Se omiten las pruebas de tarjetas porque no se pudo crear un PaymentIntent en COP.')
  }

  // Los intentos opcionales que fallaron no cuentan si COP funcionó con otra variante
  const ok = results.length > 0 && results.every((item) => item.ok || (item.optional && findings.copWorks))
  return { results, ok, findings }
}

// Mensaje final con lo que sigue
export function conclusion({ ok, findings }) {
  if (ok) return 'LISTO: la llave sirve, COP funciona y los rechazos se pueden detectar. Podemos pasar al paso 2.'
  if (!findings.copWorks) {
    return 'HAY QUE DECIDIR: no se pudo crear un PaymentIntent en COP (ver arriba). No sigo sin hablarlo: puede ser el país de la cuenta, la moneda o la llave.'
  }
  return 'HAY QUE REVISAR: algo falló (ver arriba). Mándame este resultado y lo vemos antes de seguir.'
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY ?? ''
  if (!key) {
    console.error('Falta STRIPE_SECRET_KEY en server/.env (copia server/.env.example a server/.env y escribe tu clave de PRUEBA).')
    process.exit(1)
  }
  if (!key.startsWith('sk_test_')) {
    console.error('La clave debe ser de PRUEBA y empezar por sk_test_. No se ejecuta nada con otra clase de llave.')
    process.exit(1)
  }

  const stripe = new Stripe(key, { maxNetworkRetries: 1 })
  console.log('Prueba de viabilidad de Stripe (modo de prueba). La llave no se imprime.\n')
  const outcome = await runProbe(stripe)
  console.log(`\n${conclusion(outcome)}`)
  process.exit(outcome.ok ? 0 : 2)
}

// Solo se ejecuta al lanzar el archivo directamente, no al importarlo desde una prueba
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Error inesperado: ${redact(error?.message ?? error)}`)
    process.exit(1)
  })
}

// AI-assisted: see docs/AI_LOG.md #29
import os from 'node:os'
import { pathToFileURL } from 'node:url'
import express from 'express'
import { loadConfig, ConfigError } from './config.js'
import { createStripe, createStripeGateway } from './stripeClient.js'
import { createFirestoreDb, createTripsStore } from './tripsStore.js'
import { createPayments, PaymentError, ERROR_STATUS } from './payments.js'

// Servidor local de pagos (Stripe, modo de prueba). La app lo alcanza por la red Wi-Fi: http://<IP del computador>:<PORT>.
// No tiene autenticación (igual que el resto del proyecto, que no usa Firebase Authentication): es solo para pruebas.
// Los registros nunca incluyen llaves ni cuerpos de las peticiones.

// Quita cualquier texto con forma de llave antes de escribirlo en un registro
const redact = (text) => String(text ?? '').replace(/\b(sk|rk|pk)_(test|live)_[A-Za-z0-9*_]+/g, '$1_$2_***')

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// Crea la aplicación Express a partir de los casos de uso (así se prueba sin abrir puertos)
export function createApp({ payments, log = console.log }) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '10kb' }))

  // Un registro por petición: método, ruta, estado y duración
  app.use((req, res, next) => {
    const started = Date.now()
    res.on('finish', () => log(`${req.method} ${req.path} -> ${res.statusCode} (${Date.now() - started} ms)`))
    next()
  })

  app.get('/health', (req, res) => res.json({ ok: true }))

  app.post('/payments/intent', async (req, res) => {
    if (!isPlainObject(req.body)) throw new PaymentError('invalid_request')
    const { tripId, attemptId } = req.body
    res.json(await payments.createCardPayment({ tripId, attemptId }))
  })

  app.post('/payments/confirm', async (req, res) => {
    if (!isPlainObject(req.body)) throw new PaymentError('invalid_request')
    const { tripId, paymentIntentId } = req.body
    res.json(await payments.confirmCardPayment({ tripId, paymentIntentId }))
  })

  app.use((req, res) => res.status(404).json({ error: 'not_found' }))

  // Errores: los del cobro responden con su código; los demás son internos y no revelan detalles
  app.use((error, req, res, next) => {
    if (error instanceof PaymentError) {
      return res.status(ERROR_STATUS[error.code] ?? 500).json({ error: error.code, ...error.details })
    }
    // Cuerpo que no es JSON válido, o demasiado grande
    if (error?.type === 'entity.parse.failed' || error?.type === 'entity.too.large') {
      return res.status(400).json({ error: 'invalid_request' })
    }
    log(`Error interno: ${redact(error?.message)}`)
    return res.status(500).json({ error: 'internal' })
  })

  return app
}

// Direcciones IPv4 del computador en cada red, para decirle al usuario qué poner en la app
export function localAddresses(interfaces = os.networkInterfaces()) {
  return Object.entries(interfaces).flatMap(([name, list]) =>
    (list ?? []).filter((item) => item.family === 'IPv4' && !item.internal).map((item) => ({ name, address: item.address }))
  )
}

async function main() {
  let config
  try {
    config = loadConfig()
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(error.message)
      process.exit(1)
    }
    throw error
  }

  const gateway = createStripeGateway(createStripe(config.stripeSecretKey))
  const trips = createTripsStore(createFirestoreDb(config.firebase))
  const app = createApp({ payments: createPayments({ trips, gateway }) })

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Servidor de pagos (Stripe, modo de prueba) escuchando en el puerto ${config.port}.\n`)
    console.log('Pon UNA de estas direcciones en el .env de la app (la de tu red Wi-Fi), y reinicia con "npx expo start -c":')
    for (const { name, address } of localAddresses()) {
      console.log(`  EXPO_PUBLIC_PAYMENTS_API_URL=http://${address}:${config.port}    (${name})`)
    }
    console.log('\nPrueba en el navegador del celular: la misma dirección terminada en /health debe responder {"ok":true}.')
  })
}

// Solo arranca al lanzar el archivo directamente (npm start), no al importarlo desde una prueba
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`No se pudo iniciar el servidor: ${redact(error?.message)}`)
    process.exit(1)
  })
}

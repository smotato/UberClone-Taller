// AI-assisted: see docs/AI_LOG.md #29
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Lee y valida las variables de entorno del backend. Nunca imprime valores: los errores solo nombran la variable.

const ROOT_ENV_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env')

// Variables de Firebase: nombre en server/.env  ->  nombre equivalente en el .env de la app (raíz)
const FIREBASE_VARIABLES = {
  apiKey: ['FIREBASE_API_KEY', 'EXPO_PUBLIC_FIREBASE_API_KEY'],
  authDomain: ['FIREBASE_AUTH_DOMAIN', 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'],
  projectId: ['FIREBASE_PROJECT_ID', 'EXPO_PUBLIC_FIREBASE_PROJECT_ID'],
  storageBucket: ['FIREBASE_STORAGE_BUCKET', 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: ['FIREBASE_MESSAGING_SENDER_ID', 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
  appId: ['FIREBASE_APP_ID', 'EXPO_PUBLIC_FIREBASE_APP_ID'],
}
// Sin estas tres no se puede conectar a Firestore
const REQUIRED_FIREBASE = ['apiKey', 'projectId', 'appId']

export class ConfigError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConfigError'
  }
}

// Lee del .env de la raíz solo los valores públicos de Firebase de la app, para no tener que copiarlos
export function readRootFirebaseEnv(filePath = ROOT_ENV_PATH) {
  try {
    const parsed = dotenv.parse(fs.readFileSync(filePath))
    return Object.fromEntries(Object.entries(parsed).filter(([name]) => name.startsWith('EXPO_PUBLIC_FIREBASE_')))
  } catch {
    return {}
  }
}

const clean = (value) => (typeof value === 'string' ? value.trim() : '')

// env: variables de server/.env; rootEnv: variables públicas de Firebase del .env de la raíz (opcional)
export function loadConfig(env = process.env, rootEnv = readRootFirebaseEnv()) {
  const problems = []

  const stripeSecretKey = clean(env.STRIPE_SECRET_KEY)
  if (!stripeSecretKey) problems.push('falta STRIPE_SECRET_KEY en server/.env')
  else if (!stripeSecretKey.startsWith('sk_test_')) problems.push('STRIPE_SECRET_KEY debe ser una clave de PRUEBA que empiece por sk_test_')

  const rawPort = clean(env.PORT) || '3001'
  const port = Number(rawPort)
  if (!Number.isInteger(port) || port < 1 || port > 65535) problems.push('PORT debe ser un número de puerto válido (por ejemplo 3001)')

  // El valor de server/.env manda; si falta, se usa el equivalente público del .env de la app
  const firebase = {}
  for (const [key, [serverName, rootName]] of Object.entries(FIREBASE_VARIABLES)) {
    firebase[key] = clean(env[serverName]) || clean(rootEnv[rootName])
  }
  const missingFirebase = REQUIRED_FIREBASE.filter((key) => !firebase[key])
  if (missingFirebase.length > 0) {
    problems.push(`faltan datos de Firebase (${missingFirebase.map((key) => FIREBASE_VARIABLES[key][0]).join(', ')}) en server/.env o su equivalente EXPO_PUBLIC_ en el .env de la raíz`)
  }

  if (problems.length > 0) throw new ConfigError(`Configuración inválida: ${problems.join('; ')}.`)
  return { port, stripeSecretKey, firebase }
}

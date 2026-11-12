// AI-assisted: see docs/AI_LOG.md #25
import { decodePolyline } from '../utils/polyline'

// ÚNICO archivo que habla con un proveedor de rutas. Hoy usa OpenRouteService (basado en OpenStreetMap, sin Google Cloud).
// Para cambiar de proveedor (Google Routes API, OSRM...) solo hay que reescribir este archivo y mantener sus exportaciones:
//   getDistanceMatrix(origen, destino) -> { distanceKm, durationMin } | null
//   getDirections(origen, destino)     -> { points: [{ lat, lng }], distanceKm, durationMin } | null
//   ROUTE_ATTRIBUTION                  -> texto de atribución que se muestra cuando se dibuja una ruta (null si no hace falta)
// Las funciones NO lanzan: ante cualquier fallo (sin llave, sin red, cuota agotada, respuesta inválida) devuelven null
// y quien las llama sigue el flujo con una línea recta de respaldo. Se llaman a lo sumo una vez por evento, nunca por cada movimiento.
//
// Límites del plan gratuito (Standard): Directions 2.000 solicitudes al día y 40 por minuto; Matrix 500 al día y 40 por minuto.
// Pasarse del límite diario responde 403 y del límite por minuto, 429.
// Los términos de HeiGIT piden no usar la llave del lado del cliente: aquí viaja dentro de la app (EXPO_PUBLIC_), ver el README.

const ORS_BASE_URL = 'https://api.openrouteservice.org'
const PROFILE = 'driving-car'
const DIRECTIONS_URL = `${ORS_BASE_URL}/v2/directions/${PROFILE}`
const MATRIX_URL = `${ORS_BASE_URL}/v2/matrix/${PROFILE}`
const DEFAULT_TIMEOUT_MS = 10000
// Las rutas del proveedor son más largas que las que guarda la app (hasta 100 puntos)
const MAX_PROVIDER_POLYLINE_LENGTH = 200000

// Atribución obligatoria de los datos de OpenStreetMap
export const ROUTE_ATTRIBUTION = '© OpenStreetMap contributors'

const warn = (message) => {
  if (__DEV__) console.warn(`[routesServices] ${message}`)
}

const isCoordinate = (point) => point && Number.isFinite(point.lat) && Number.isFinite(point.lng)
// OpenRouteService usa [longitud, latitud]
const lngLat = (point) => [point.lng, point.lat]
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value)

// Metros -> kilómetros con un decimal; segundos -> minutos enteros (mínimo 1)
const toKm = (meters) => Math.round(meters / 100) / 10
const toMinutes = (seconds) => Math.max(1, Math.round(seconds / 60))

// ---------- Interpretación de las respuestas (funciones puras, exportadas para probarlas) ----------

// Respuesta de Directions -> { points, distanceKm, durationMin } o null.
// Si la ruta no trae una geometría válida, devuelve points vacío pero conserva la distancia y la duración
export function parseDirections(json) {
  const route = json?.routes?.[0]
  const summary = route?.summary
  if (!summary || !isFiniteNumber(summary.distance) || summary.distance < 0 || !isFiniteNumber(summary.duration) || summary.duration < 0) {
    return null
  }
  return {
    points: decodePolyline(route.geometry, MAX_PROVIDER_POLYLINE_LENGTH),
    distanceKm: toKm(summary.distance),
    durationMin: toMinutes(summary.duration),
  }
}

// Respuesta de Matrix de dos ubicaciones (0 = origen, 1 = destino) -> { distanceKm, durationMin } o null.
// Un valor nulo en la matriz significa que no hay ruta entre los puntos
export function parseMatrix(json) {
  const distance = json?.distances?.[0]?.[1]
  const duration = json?.durations?.[0]?.[1]
  if (!isFiniteNumber(distance) || distance < 0 || !isFiniteNumber(duration) || duration < 0) return null
  return { distanceKm: toKm(distance), durationMin: toMinutes(duration) }
}

// Mensaje de error de la respuesta ({ error: { message } } o { error: "texto" }); null si no es un error
export function parseProviderError(json) {
  const error = json?.error
  if (typeof error === 'string') return error
  return typeof error?.message === 'string' ? error.message : null
}

// ---------- Red ----------

// POST con espera máxima. Devuelve el JSON de la respuesta, o null si algo falla
async function postJson(url, body, timeoutMs) {
  // La llave se lee al llamar, no al cargar el archivo
  const apiKey = process.env.EXPO_PUBLIC_ORS_API_KEY
  if (!apiKey) {
    warn('falta EXPO_PUBLIC_ORS_API_KEY en el .env; se usará la línea de respaldo')
    return null
  }

  let timer
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve('timeout'), timeoutMs)
  })

  try {
    const request = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // OpenRouteService recibe la llave tal cual en Authorization, sin "Bearer"
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
    }).then(async (response) => {
      let json = null
      try { json = await response.json() } catch { /* respuesta sin JSON */ }
      if (!response.ok) {
        // 403 = cuota diaria agotada o llave inválida; 429 = demasiadas solicitudes por minuto. Nunca se imprime la llave
        warn(`HTTP ${response.status}: ${parseProviderError(json) ?? 'sin detalle'}`)
        return null
      }
      return json
    })

    const result = await Promise.race([request, timeout])
    if (result === 'timeout') {
      warn('tiempo de espera agotado')
      return null
    }
    return result
  } catch {
    warn('error de red')
    return null
  } finally {
    clearTimeout(timer)
  }
}

// Distancia y duración entre dos puntos { lat, lng } -> { distanceKm, durationMin } o null
export async function getDistanceMatrix(origin, destination, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!isCoordinate(origin) || !isCoordinate(destination)) return null
  const body = {
    locations: [lngLat(origin), lngLat(destination)],
    metrics: ['distance', 'duration'],
  }
  return parseMatrix(await postJson(MATRIX_URL, body, timeoutMs))
}

// Ruta entre dos puntos { lat, lng } -> { points: [{ lat, lng }], distanceKm, durationMin } o null
export async function getDirections(origin, destination, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!isCoordinate(origin) || !isCoordinate(destination)) return null
  const body = { coordinates: [lngLat(origin), lngLat(destination)] }
  return parseDirections(await postJson(DIRECTIONS_URL, body, timeoutMs))
}

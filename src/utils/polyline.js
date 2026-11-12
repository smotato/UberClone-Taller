// AI-assisted: see docs/AI_LOG.md #23
// Funciones puras para guardar una ruta de forma compacta: polilínea codificada (algoritmo de Google, precisión 5).
// Una ruta de hasta 100 puntos pesa unos cientos de bytes, muy lejos del límite de 1 MiB por documento.

// Máximo de puntos que se guardan por ruta
export const MAX_ROUTE_POINTS = 100
// Una cadena más larga que esto no es una ruta guardada por la app; se descarta
const MAX_ENCODED_LENGTH = 5000
const PRECISION = 1e5

// Reduce la lista a máximo maxPoints puntos repartidos de forma pareja, conservando el primero y el último
export function reducePoints(points, maxPoints = MAX_ROUTE_POINTS) {
  const list = Array.isArray(points) ? points : []
  if (list.length <= maxPoints || maxPoints < 2) return list.slice(0, Math.max(maxPoints, 0))
  const step = (list.length - 1) / (maxPoints - 1)
  return Array.from({ length: maxPoints }, (_, i) => list[Math.round(i * step)])
}

// Codifica un número (ya multiplicado por la precisión y redondeado) en caracteres ASCII
const encodeValue = (value) => {
  let v = value < 0 ? ~(value << 1) : value << 1
  let output = ''
  while (v >= 0x20) {
    output += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
    v >>= 5
  }
  return output + String.fromCharCode(v + 63)
}

// Lista de { lat, lng } -> cadena. Reduce a maxPoints antes de codificar. Ignora puntos inválidos
export function encodePolyline(points, maxPoints = MAX_ROUTE_POINTS) {
  const valid = (Array.isArray(points) ? points : []).filter(
    (p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng)
  )
  let prevLat = 0
  let prevLng = 0
  return reducePoints(valid, maxPoints).map((p) => {
    const lat = Math.round(p.lat * PRECISION)
    const lng = Math.round(p.lng * PRECISION)
    const chunk = encodeValue(lat - prevLat) + encodeValue(lng - prevLng)
    prevLat = lat
    prevLng = lng
    return chunk
  }).join('')
}

// Cadena -> lista de { lat, lng }. Con una cadena ausente, vacía o inválida devuelve [] sin lanzar error
export function decodePolyline(encoded) {
  if (typeof encoded !== 'string' || encoded.length === 0 || encoded.length > MAX_ENCODED_LENGTH) return []

  const points = []
  let index = 0
  let lat = 0
  let lng = 0

  // Lee un número codificado; devuelve null si la cadena termina a medias o trae caracteres fuera de rango
  const readValue = () => {
    let result = 0
    let shift = 0
    let byte
    do {
      if (index >= encoded.length) return null
      byte = encoded.charCodeAt(index++) - 63
      if (byte < 0 || byte > 63) return null
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20 && shift < 35)
    if (byte >= 0x20) return null
    return result & 1 ? ~(result >> 1) : result >> 1
  }

  while (index < encoded.length) {
    const dLat = readValue()
    const dLng = readValue()
    if (dLat === null || dLng === null) return []
    lat += dLat
    lng += dLng
    const point = { lat: lat / PRECISION, lng: lng / PRECISION }
    // Una coordenada fuera de rango indica una cadena corrupta
    if (Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180) return []
    points.push(point)
  }
  return points
}

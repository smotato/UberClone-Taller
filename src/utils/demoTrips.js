// AI-assisted: see docs/AI_LOG.md #23
import { buildTripAmounts } from './calculateFare'
import { encodePolyline } from './polyline'
import { startOfToday, startOfWeek, startOfMonth } from './dateRanges'

// Viajes de ejemplo SOLO para desarrollo: no hay app de pasajero, así que sirven para ver Ganancias e Historial.
// Función pura (sin Firebase): devuelve la lista; quien la llama decide si la guarda.

// Coordenada de respaldo (Cali) cuando el conductor aún no tiene ubicación guardada
export const DEFAULT_BASE_LOCATION = { lat: 3.4516, lng: -76.532 }

const ADDRESSES = [
  'Calle 5 # 38-20 (ejemplo)', 'Carrera 100 # 14-30 (ejemplo)', 'Avenida 6N # 25-10 (ejemplo)',
  'Calle 9 # 24-50 (ejemplo)', 'Carrera 1 # 62-40 (ejemplo)', 'Avenida Roosevelt # 23-15 (ejemplo)',
  'Calle 70 # 3N-25 (ejemplo)', 'Carrera 56 # 5-80 (ejemplo)', 'Calle 13 # 100-45 (ejemplo)', 'Avenida 3N # 45-60 (ejemplo)',
]

// Plan de los 15 viajes. slot: en qué periodo caen. Los 'completed' con pago pendiente o rechazado no suman dinero.
// Dos viajes no llevan ruta (route: null) para probar ese caso en el detalle.
const BLUEPRINTS = [
  { slot: 'today', category: 'economy', method: 'stripe', status: 'paid', tip: 2000, rating: 5, hasRoute: true },
  { slot: 'today', category: 'xl', method: 'cash', status: 'paid', tip: 0, rating: 4, hasRoute: true },
  { slot: 'today', category: 'economy', method: 'stripe', status: 'completed', paymentStatus: 'pending', tip: 0, rating: null, hasRoute: true },
  { slot: 'week', category: 'premium', method: 'stripe', status: 'paid', tip: 5000, rating: 5, hasRoute: true },
  { slot: 'week', category: 'economy', method: 'cash', status: 'paid', tip: 1000, rating: 4, hasRoute: false },
  { slot: 'week', category: 'xl', method: 'stripe', status: 'paid', tip: 0, rating: null, hasRoute: true },
  { slot: 'week', category: 'economy', method: 'stripe', status: 'completed', paymentStatus: 'rejected', tip: 0, rating: 3, hasRoute: true },
  { slot: 'month', category: 'economy', method: 'cash', status: 'paid', tip: 0, rating: 5, hasRoute: true },
  { slot: 'month', category: 'premium', method: 'stripe', status: 'paid', tip: 3000, rating: 4, hasRoute: true },
  { slot: 'month', category: 'xl', method: 'stripe', status: 'paid', tip: 0, rating: 3, hasRoute: false },
  { slot: 'month', category: 'economy', method: 'cash', status: 'paid', tip: 500, rating: 5, hasRoute: true },
  { slot: 'older', category: 'economy', method: 'stripe', status: 'paid', tip: 0, rating: 4, hasRoute: true },
  { slot: 'older', category: 'xl', method: 'cash', status: 'paid', tip: 2000, rating: 5, hasRoute: true },
  { slot: 'older', category: 'premium', method: 'stripe', status: 'paid', tip: 0, rating: 5, hasRoute: true },
  { slot: 'older', category: 'economy', method: 'stripe', status: 'completed', paymentStatus: 'pending', tip: 0, rating: null, hasRoute: true },
]

const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE
// Un periodo necesita al menos este margen para ubicar viajes dentro
const MIN_SLOT_MS = 2 * MINUTE

// Generador pseudoaleatorio con semilla: los mismos datos en cada carga
const seeded = (seed) => {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Distancia en km entre dos coordenadas (fórmula de haversine)
const haversineKm = (a, b) => {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

// Ruta de unos 20 puntos entre origen y destino, con una curva suave
const buildRoutePoints = (origin, destination, count = 20) =>
  Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    const wiggle = Math.sin(t * Math.PI) * 0.004
    return {
      lat: origin.lat + (destination.lat - origin.lat) * t + wiggle,
      lng: origin.lng + (destination.lng - origin.lng) * t - wiggle,
    }
  })

// Reparte los viajes de un periodo de forma pareja dentro de [from, to); null si el periodo no existe
const slotTime = (from, to, index, total) => {
  if (to - from < MIN_SLOT_MS) return null
  return Math.round(from + ((to - from) * (index + 1)) / (total + 1))
}

// Genera los viajes de ejemplo. Si un periodo no tiene espacio (p. ej. "esta semana" un lunes), se omiten sus viajes.
export function buildDemoTrips({ driverId, now = new Date(), base = null }) {
  const center = base && Number.isFinite(base.lat) && Number.isFinite(base.lng) ? base : DEFAULT_BASE_LOCATION
  const nowMs = now.getTime()
  const todayStart = startOfToday(now).getTime()
  const weekStart = startOfWeek(now).getTime()
  const monthStart = startOfMonth(now).getTime()

  const slots = {
    today: { from: todayStart + MINUTE, to: nowMs - MINUTE },
    week: { from: weekStart, to: todayStart },
    month: { from: monthStart, to: Math.min(weekStart, todayStart) },
    // Meses anteriores: 3, 12 y 40 días antes del inicio del mes actual
    older: null,
  }
  const olderOffsets = [3, 12, 40]
  const slotTotals = BLUEPRINTS.reduce((acc, b) => ({ ...acc, [b.slot]: (acc[b.slot] ?? 0) + 1 }), {})
  const slotCounters = {}

  return BLUEPRINTS.reduce((trips, blueprint, i) => {
    const index = slotCounters[blueprint.slot] ?? 0
    slotCounters[blueprint.slot] = index + 1

    // En "older" se suman minutos por viaje para que ningún completedAt se repita
    const completedAt = blueprint.slot === 'older'
      ? monthStart - olderOffsets[index % olderOffsets.length] * DAY + 12 * 60 * MINUTE + index * 7 * MINUTE
      : slotTime(slots[blueprint.slot].from, slots[blueprint.slot].to, index, slotTotals[blueprint.slot])
    if (completedAt === null) return trips

    const random = seeded(i + 1)
    const origin = { lat: center.lat + (random() - 0.5) * 0.04, lng: center.lng + (random() - 0.5) * 0.04 }
    const destination = { lat: origin.lat + (random() - 0.5) * 0.06, lng: origin.lng + (random() - 0.5) * 0.06 }
    // La ruta real es más larga que la línea recta
    const distanceKm = Math.max(1, Math.round(haversineKm(origin, destination) * 1.3 * 10) / 10)
    const durationMin = Math.max(4, Math.round(distanceKm / 0.45))
    const amounts = buildTripAmounts({ distanceKm, durationMin, category: blueprint.category, tip: blueprint.tip })
    const isCash = blueprint.method === 'cash'

    trips.push({
      driverId,
      passengerId: `demo-passenger-${i + 1}`,
      origin: { ...origin, address: ADDRESSES[i % ADDRESSES.length] },
      destination: { ...destination, address: ADDRESSES[(i + 4) % ADDRESSES.length] },
      route: blueprint.hasRoute ? encodePolyline(buildRoutePoints(origin, destination)) : null,
      distanceKm,
      durationMin,
      category: blueprint.category,
      ...amounts,
      paymentMethod: blueprint.method,
      paymentStatus: blueprint.status === 'paid' ? (isCash ? 'cash' : 'approved') : blueprint.paymentStatus,
      paymentId: blueprint.status === 'paid' && !isCash ? `demo-payment-${i + 1}` : null,
      status: blueprint.status,
      rating: blueprint.rating,
      createdAt: completedAt - (durationMin + 4) * MINUTE,
      completedAt,
      isDemo: true,
    })
    return trips
  }, [])
}

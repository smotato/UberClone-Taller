// AI-assisted: see docs/AI_LOG.md #23
import { startOfToday, startOfWeek, startOfMonth, endOfDay } from './dateRanges'

// Funciones puras (sin React ni Firebase) para los totales de Ganancias.
// Solo cuentan los viajes con status 'paid'; un viaje 'completed' con pago pendiente o rechazado no suma dinero.

// Métodos de pago que cubre el saldo
// AI-assisted: see docs/AI_LOG.md #29
export const GATEWAY_METHOD = 'stripe'
export const CASH_METHOD = 'cash'

const toNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

// Lee completedAt (número, texto o valor con toDate()) y devuelve milisegundos, o null si no es válido
export const getCompletedMs = (trip) => {
  const value = trip?.completedAt
  if (!value) return null
  const ms = typeof value.toDate === 'function' ? value.toDate().getTime() : new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}

// Viaje pagado con fecha de cierre válida
const isCountable = (trip) => trip?.status === 'paid' && getCompletedMs(trip) !== null

// Resumen de una lista de viajes: { count, billed, commissions, tips, net, average }
export function summarizeTrips(trips) {
  const paid = (trips ?? []).filter(isCountable)
  const summary = paid.reduce(
    (acc, trip) => ({
      count: acc.count + 1,
      billed: acc.billed + toNumber(trip.fare),
      commissions: acc.commissions + toNumber(trip.commission),
      tips: acc.tips + toNumber(trip.tip),
      net: acc.net + toNumber(trip.driverEarnings),
    }),
    { count: 0, billed: 0, commissions: 0, tips: 0, net: 0 }
  )
  // Promedio por viaje: ganancia neta entre viajes, entero redondeado; 0 si no hay viajes
  return { ...summary, average: summary.count ? Math.round(summary.net / summary.count) : 0 }
}

// Resumen de hoy, semana (desde el lunes) y mes, según completedAt y la hora local
export function splitByPeriod(trips, now = new Date()) {
  const end = endOfDay(now).getTime()
  const inPeriod = (start) => (trips ?? []).filter((trip) => {
    const ms = getCompletedMs(trip)
    return ms !== null && ms >= start.getTime() && ms <= end
  })
  return {
    today: summarizeTrips(inPeriod(startOfToday(now))),
    week: summarizeTrips(inPeriod(startOfWeek(now))),
    month: summarizeTrips(inPeriod(startOfMonth(now))),
  }
}

// Saldo sobre una lista de viajes: ganancias de la pasarela menos comisiones del efectivo (puede ser negativo).
// La pantalla usa las agregaciones de Firestore; esta versión sirve para pruebas y listas ya cargadas
export function computeBalance(trips) {
  return (trips ?? []).filter(isCountable).reduce((balance, trip) => {
    if (trip.paymentMethod === GATEWAY_METHOD) return balance + toNumber(trip.driverEarnings)
    if (trip.paymentMethod === CASH_METHOD) return balance - toNumber(trip.commission)
    return balance
  }, 0)
}

// Descuadre del saldo: hay viajes 'paid' que las consultas (stripe y cash) no cubren,
// por ejemplo con un paymentMethod distinto. Compara el conteo total contra la suma de lo cubierto
export const hasBalanceMismatch = (totalPaidCount, coveredCount) => totalPaidCount !== coveredCount

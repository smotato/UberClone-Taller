// AI-assisted: see docs/AI_LOG.md #23
// Funciones puras para calcular periodos con la hora local del celular.
// Ganancias e Historial usan estas mismas funciones, así la regla es una sola:
// día desde las 00:00, semana desde el lunes a las 00:00 y mes desde el día 1 a las 00:00.

// Inicio (00:00) del día de la fecha recibida
export const startOfDay = (date = new Date()) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Final (23:59:59.999) del día de la fecha recibida
export const endOfDay = (date = new Date()) => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export const startOfToday = (now = new Date()) => startOfDay(now)

// La semana empieza el lunes: getDay() devuelve 0 para el domingo, así que retrocede 6 días
export const startOfWeek = (now = new Date()) => {
  const d = startOfDay(now)
  const daysSinceMonday = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - daysSinceMonday)
  return d
}

export const startOfMonth = (now = new Date()) => {
  const d = startOfDay(now)
  d.setDate(1)
  return d
}

// Periodo más antiguo que necesita Ganancias: el menor entre el inicio de la semana y el del mes
export const startOfEarliestPeriod = (now = new Date()) =>
  new Date(Math.min(startOfWeek(now).getTime(), startOfMonth(now).getTime()))

// Rango { from, to } en milisegundos para un filtro del Historial: 'today' | 'week' | 'month' | 'custom'.
// Los periodos terminan al final de hoy (no hay viajes futuros). 'custom' incluye completo el día "hasta".
// Devuelve null si el filtro no existe o si el rango personalizado está incompleto o invertido.
export function getRange(filter, customFrom = null, customTo = null, now = new Date()) {
  if (filter === 'today') return { from: startOfToday(now).getTime(), to: endOfDay(now).getTime() }
  if (filter === 'week') return { from: startOfWeek(now).getTime(), to: endOfDay(now).getTime() }
  if (filter === 'month') return { from: startOfMonth(now).getTime(), to: endOfDay(now).getTime() }
  if (filter === 'custom') {
    if (!(customFrom instanceof Date) || !(customTo instanceof Date)) return null
    if (Number.isNaN(customFrom.getTime()) || Number.isNaN(customTo.getTime())) return null
    const from = startOfDay(customFrom).getTime()
    const to = endOfDay(customTo).getTime()
    return from > to ? null : { from, to }
  }
  return null
}

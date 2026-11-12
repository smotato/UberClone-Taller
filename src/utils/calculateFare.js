// AI-assisted: see docs/AI_LOG.md #23
import { PRICING } from '../config/pricing'

// Valida un número no negativo; un dato inválido es un error de programación, no de usuario
const assertNonNegative = (value, name) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new RangeError(`calculateFare: ${name} debe ser un número mayor o igual a 0`)
  }
}

// Calcula la tarifa de un viaje, la comisión de la plataforma y la ganancia neta del conductor.
// Función pura (sin React ni Firebase): la usan la estimación y el cierre del viaje.
// Devuelve pesos enteros: { fare, commission, driverEarnings }
export function calculateFare({ distanceKm, durationMin, category, tip = 0 }) {
  assertNonNegative(distanceKm, 'distanceKm')
  assertNonNegative(durationMin, 'durationMin')
  assertNonNegative(tip, 'tip')
  if (!Number.isInteger(tip)) {
    throw new RangeError('calculateFare: tip debe ser un número entero de pesos')
  }

  const multiplier = PRICING.categoryMultipliers[category]
  if (multiplier === undefined) {
    throw new RangeError(`calculateFare: categoría desconocida "${category}"`)
  }

  // Base + distancia + tiempo, por el multiplicador de la categoría, nunca por debajo del mínimo
  const rawFare = Math.max(
    PRICING.minimumFare,
    (PRICING.baseFare + distanceKm * PRICING.perKm + durationMin * PRICING.perMinute) * multiplier
  )

  // Se redondea al múltiplo más cercano antes de calcular la comisión
  const fare = Math.round(rawFare / PRICING.roundTo) * PRICING.roundTo
  const commission = Math.round(fare * PRICING.commissionRate)
  // La propina va completa al conductor
  const driverEarnings = fare - commission + tip

  return { fare, commission, driverEarnings }
}

// Montos que se guardan al cerrar un viaje: siempre números enteros, con la comisión aplicada en ese viaje.
// Las agregaciones de Firestore (saldo) ignoran los valores que no son numéricos, por eso nunca se guarda otra cosa
export function buildTripAmounts({ distanceKm, durationMin, category, tip = 0 }) {
  const { fare, commission, driverEarnings } = calculateFare({ distanceKm, durationMin, category, tip })
  return { fare, commission, tip, driverEarnings, commissionRate: PRICING.commissionRate }
}

// Comprueba que un viaje por guardar trae sus montos como números enteros y que cuadran entre sí
export function assertTripAmounts(trip) {
  const money = ['fare', 'commission', 'tip', 'driverEarnings']
  money.forEach((field) => {
    if (!Number.isInteger(trip?.[field]) || trip[field] < 0) {
      throw new RangeError(`assertTripAmounts: ${field} debe ser un número entero mayor o igual a 0`)
    }
  })
  if (typeof trip.commissionRate !== 'number' || !(trip.commissionRate >= 0 && trip.commissionRate <= 1)) {
    throw new RangeError('assertTripAmounts: commissionRate debe ser un número entre 0 y 1')
  }
  if (trip.driverEarnings !== trip.fare - trip.commission + trip.tip) {
    throw new RangeError('assertTripAmounts: driverEarnings no coincide con tarifa - comisión + propina')
  }
}

export default calculateFare

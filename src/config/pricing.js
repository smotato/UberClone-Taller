// AI-assisted: see docs/AI_LOG.md #23
// Único lugar de las tarifas, los multiplicadores y la comisión (valores didácticos del taller, no tarifas reales).
// Todos los montos son pesos colombianos enteros.

export const PRICING = {
  // Tarifa base del viaje
  baseFare: 3500,
  // Valor por kilómetro recorrido
  perKm: 1200,
  // Valor por minuto de duración
  perMinute: 250,
  // Tarifa mínima: ningún viaje cuesta menos
  minimumFare: 6000,
  // Multiplicador según la categoría del vehículo
  categoryMultipliers: {
    economy: 1.0,
    xl: 1.4,
    premium: 1.8,
  },
  // Comisión de la plataforma sobre la tarifa (20 %); las propinas no pagan comisión
  commissionRate: 0.2,
  // La tarifa se redondea al múltiplo más cercano de este valor
  roundTo: 100,
}

export default PRICING

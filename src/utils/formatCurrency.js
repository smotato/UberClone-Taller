// AI-assisted: see docs/AI_LOG.md #23
// Formato de pesos colombianos enteros con puntos de miles, por ejemplo $19.200.
// Se hace a mano porque no hay confirmación en la documentación de que Intl funcione igual en Hermes en ambas plataformas.
export function formatCurrency(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '$0'

  const rounded = Math.round(value)
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  // Un monto negativo conserva el signo (p. ej. un saldo en contra)
  return `${rounded < 0 ? '-' : ''}$${digits}`
}

export default formatCurrency

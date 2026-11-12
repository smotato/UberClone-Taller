// AI-assisted: see docs/AI_LOG.md #25
// Constantes del flujo del viaje (taller, sección 3): un solo lugar para los tiempos y los estados.

// Tiempo que tiene el conductor para aceptar o rechazar una solicitud; al llegar a cero se rechaza sola
export const REQUEST_TIMEOUT_SECONDS = 15

// Espera máxima, en milisegundos, de cada escritura del viaje. Sin red, Firestore no falla: queda esperando
export const WRITE_TIMEOUT_MS = 10000

// Motivos con los que el conductor rechaza una solicitud
export const REJECT_REASONS = ['declined', 'timeout']

// Estados de un viaje en curso. Un viaje 'completed' en efectivo también cuenta como activo hasta que se cobra
export const ACTIVE_STATUSES = ['accepted', 'driver_arriving', 'in_progress']

// Campos que ninguna transición puede modificar
export const PROTECTED_TRIP_FIELDS = [
  'driverId', 'passengerId', 'origin', 'destination', 'category', 'paymentMethod', 'createdAt',
]

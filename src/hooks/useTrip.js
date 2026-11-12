// AI-assisted: see docs/AI_LOG.md #25
import { useContext } from 'react'
import { TripContext } from '../context/TripContext'

// Acceso al viaje activo y a las solicitudes entrantes (mismo patrón que useSession)
export default function useTrip() {
  const context = useContext(TripContext)

  if (!context) {
    throw new Error('useTrip debe ser usado dentro de un <TripProvider>')
  }

  return context
}

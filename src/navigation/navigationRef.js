// AI-assisted: see docs/AI_LOG.md #25
import { createNavigationContainerRef } from '@react-navigation/native'

// Referencia al contenedor de navegación: permite navegar desde fuera de las pantallas (por ejemplo, desde TripContext).
// Antes de usarla hay que comprobar navigationRef.isReady()
export const navigationRef = createNavigationContainerRef()

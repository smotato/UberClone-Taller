// AI-assisted: see docs/AI_LOG.md #18

import { useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Solo se guardan el driverId y un indicador de sesión activa.
// Nunca correo, documento de identidad ni otros datos personales o sensibles.
export const STORAGE_KEYS = {
  driverId: '@uberclone/driverId',
  session: '@uberclone/session',
}

// No captura errores: se dejan propagar para que SessionContext los maneje
export default function useStorage() {
  return useMemo(() => ({
    getDriverId: () => AsyncStorage.getItem(STORAGE_KEYS.driverId),
    saveDriverId: (id) => AsyncStorage.setItem(STORAGE_KEYS.driverId, id),
    removeDriverId: () => AsyncStorage.removeItem(STORAGE_KEYS.driverId),
    getSessionActive: async () => (await AsyncStorage.getItem(STORAGE_KEYS.session)) === 'true',
    // Guarda el indicador cuando es true y borra la clave cuando es false
    setSessionActive: (active) => (
      active
        ? AsyncStorage.setItem(STORAGE_KEYS.session, 'true')
        : AsyncStorage.removeItem(STORAGE_KEYS.session)
    ),
  }), [])
}

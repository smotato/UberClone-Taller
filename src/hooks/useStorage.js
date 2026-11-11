// AI-assisted: see docs/AI_LOG.md #18

import { useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Solo se guardan el driverId y un indicador de sesión activa.
// Nunca correo, documento de identidad ni otros datos personales o sensibles.
export const STORAGE_KEYS = {
  driverId: '@uberclone/driverId',
  session: '@uberclone/session',
  // Solo el indicador de disponibilidad, nunca la ubicación
  lastAvailability: '@uberclone/lastAvailability',
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
    // Último estado de disponibilidad elegido por el conductor
    getLastAvailability: async () => (await AsyncStorage.getItem(STORAGE_KEYS.lastAvailability)) === 'true',
    // Guarda 'true' cuando está disponible y borra la clave cuando no
    saveLastAvailability: (active) => (
      active
        ? AsyncStorage.setItem(STORAGE_KEYS.lastAvailability, 'true')
        : AsyncStorage.removeItem(STORAGE_KEYS.lastAvailability)
    ),
  }), [])
}

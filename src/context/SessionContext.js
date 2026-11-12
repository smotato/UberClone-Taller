// AI-assisted: see docs/AI_LOG.md #18

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import useStorage from '../hooks/useStorage'
import useLanguage from '../hooks/useLanguage'
import { getDriver, listenDriver, setDriverAvailability } from '../services/driverServices'

// Idiomas que la app sabe mostrar
const VALID_LANGUAGES = ['es', 'en']

// Tiempo máximo en milisegundos que el cierre de sesión espera a Firestore para poner isAvailable en false
const LOGOUT_AVAILABILITY_TIMEOUT_MS = 3000

export const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const storage = useStorage()
  const { setLanguage } = useLanguage()

  // 'loading' | 'unregistered' | 'loggedOut' | 'loggedIn'
  const [sessionState, setSessionState] = useState('loading')
  const [driverId, setDriverId] = useState(null)
  const [driver, setDriver] = useState(null)
  const [bootstrapError, setBootstrapError] = useState(false)

  // Aplica el idioma guardado del conductor, solo si es uno válido
  const applyDriverLanguage = useCallback((currentDriver) => {
    if (VALID_LANGUAGES.includes(currentDriver?.language)) {
      setLanguage(currentDriver.language)
    }
  }, [setLanguage])

  // Borra todo lo guardado en el celular y vuelve al registro
  const resetToUnregistered = useCallback(async () => {
    await storage.removeDriverId()
    await storage.setSessionActive(false)
    setDriverId(null)
    setDriver(null)
    setSessionState('unregistered')
  }, [storage])

  // Arranque: decide en qué estado queda la app según lo guardado y lo que hay en Firestore
  const bootstrap = useCallback(async () => {
    setBootstrapError(false)
    setSessionState('loading')
    try {
      const savedId = await storage.getDriverId()
      if (!savedId) {
        setSessionState('unregistered')
        return
      }

      const savedDriver = await getDriver(savedId)
      if (!savedDriver) {
        // El documento ya no existe en Firestore: se limpia todo
        await resetToUnregistered()
        return
      }

      const active = await storage.getSessionActive()
      setDriverId(savedId)
      setDriver(savedDriver)
      if (active) applyDriverLanguage(savedDriver)
      setSessionState(active ? 'loggedIn' : 'loggedOut')
    } catch {
      // Sin red u otro fallo: no se trata como "sin registro", se ofrece reintentar
      setBootstrapError(true)
    }
  }, [storage, resetToUnregistered, applyDriverLanguage])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  // Escucha en vivo el documento del conductor mientras haya sesión activa
  useEffect(() => {
    if (sessionState !== 'loggedIn' || !driverId) return

    const unsubscribe = listenDriver(
      driverId,
      (liveDriver) => {
        if (liveDriver) {
          setDriver(liveDriver)
        } else {
          // El documento fue borrado en Firestore
          resetToUnregistered().catch(() => {})
        }
      },
      () => {
        // Si la escucha falla se conserva el último estado conocido
      }
    )
    // Limpieza de la suscripción al cerrar sesión o desmontar
    return unsubscribe
  }, [sessionState, driverId, resetToUnregistered])

  // Tras registrarse se guarda el driverId, pero la sesión NO se activa: toca iniciar sesión
  const registerDriver = useCallback(async (newDriverId) => {
    await storage.saveDriverId(newDriverId)
    setDriverId(newDriverId)
    setSessionState('loggedOut')
  }, [storage])

  // Los errores de red se lanzan para que la pantalla los capture
  const login = useCallback(async ({ email, idNumber }) => {
    if (!driverId) return { ok: false }

    const savedDriver = await getDriver(driverId)
    if (!savedDriver) return { ok: false }

    const sameEmail = savedDriver.email === email.trim().toLowerCase()
    const sameId = savedDriver.idNumber === idNumber.trim()
    if (!sameEmail || !sameId) return { ok: false }

    await storage.setSessionActive(true)
    setDriver(savedDriver)
    applyDriverLanguage(savedDriver)
    setSessionState('loggedIn')
    return { ok: true }
  }, [driverId, storage, applyDriverLanguage])

  // Cierra solo la sesión activa: se conserva el driverId para volver a Login
  const logout = useCallback(async () => {
    // Mejor esfuerzo: deja al conductor no disponible. Sin red, la escritura de Firestore no termina,
    // así que se espera un máximo de tiempo y se cierra la sesión igualmente.
    if (driverId) {
      try {
        await Promise.race([
          setDriverAvailability(driverId, false),
          new Promise((resolve) => setTimeout(resolve, LOGOUT_AVAILABILITY_TIMEOUT_MS)),
        ])
      } catch {
        // Si falla se continúa con el cierre de sesión
      }
    }
    try {
      await storage.saveLastAvailability(false)
    } catch {
      // Borrar el último estado guardado también es de mejor esfuerzo
    }
    await storage.setSessionActive(false)
    setSessionState('loggedOut')
  }, [storage, driverId])

  const retryBootstrap = useCallback(() => bootstrap(), [bootstrap])

  const value = useMemo(
    () => ({
      sessionState,
      driverId,
      driver,
      driverStatus: driver?.status ?? null,
      isApproved: driver?.status === 'approved',
      bootstrapError,
      registerDriver,
      login,
      logout,
      retryBootstrap,
    }),
    [sessionState, driverId, driver, bootstrapError,
      registerDriver, login, logout, retryBootstrap]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

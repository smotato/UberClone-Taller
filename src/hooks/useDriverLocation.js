// AI-assisted: see docs/AI_LOG.md #19
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import * as Location from 'expo-location'

// Este es el único archivo que importa expo-location.
// Si se cambia de librería de ubicación, solo debe cambiar este hook.

// Cada cuánto como mínimo se recibe una nueva posición (Android), en milisegundos
const UPDATE_INTERVAL_MS = 7000
// Distancia mínima en metros para recibir una nueva posición; evita escrituras si el conductor está quieto
const MIN_DISTANCE_METERS = 12

// Cada cuánto se vuelve a consultar si el servicio de ubicación está encendido, en milisegundos
const SERVICES_POLL_MS = 3000

// Cada cuánto se reintenta la lectura inicial de la posición si falla, en milisegundos
const POSITION_RETRY_MS = 4000

// Convierte la respuesta de permisos de expo-location a nuestro valor simple
const toPermission = (response) => {
  if (response.granted) return 'granted'
  return response.status === 'denied' ? 'denied' : 'undetermined'
}

const toLatLng = (position) => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
})

// Devuelve { location, permission, requestPermission, servicesEnabled, checkServices, error }.
// tracking = true y permiso concedido => mantiene un observador de la posición.
// servicesEnabled: null mientras se consulta, luego true o false (servicio de ubicación/GPS del teléfono).
export default function useDriverLocation({ tracking }) {
  const [location, setLocation] = useState(null)
  const [permission, setPermission] = useState('undetermined')
  const [servicesEnabled, setServicesEnabled] = useState(null)
  const [error, setError] = useState(null)

  // Evita pedir el permiso más de una vez por montaje (también en el doble efecto del modo estricto)
  const initStarted = useRef(false)
  // Permite saber en el efecto de lectura si ya hay una posición sin depender de ella
  const hasLocation = useRef(false)

  // Consulta si el servicio de ubicación del teléfono está encendido; devuelve true o false.
  // Si la consulta falla no se bloquea al conductor: se devuelve true y se expone el error.
  const checkServices = useCallback(async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync()
      setServicesEnabled(enabled)
      return enabled
    } catch (e) {
      setError(e)
      return true
    }
  }, [])

  // Al montar: consulta el servicio y el permiso; si aún no se ha decidido, lo pide una sola vez
  useEffect(() => {
    if (initStarted.current) return
    initStarted.current = true

    const init = async () => {
      checkServices()
      try {
        let response = await Location.getForegroundPermissionsAsync()
        if (toPermission(response) === 'undetermined') {
          response = await Location.requestForegroundPermissionsAsync()
        }
        setPermission(toPermission(response))
      } catch (e) {
        setError(e)
      }
    }

    init()
  }, [checkServices])

  // Vuelve a consultar el servicio al regresar a la app (por ejemplo, desde los ajustes del teléfono)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkServices()
    })
    return () => subscription.remove()
  }, [checkServices])

  // Consulta el servicio cada pocos segundos: el panel de ajustes rápidos del teléfono lo enciende
  // o apaga sin que la app cambie de estado, y expo-location no ofrece un evento para detectarlo
  useEffect(() => {
    const id = setInterval(checkServices, SERVICES_POLL_MS)
    return () => clearInterval(id)
  }, [checkServices])

  // Lee la posición actual una vez para centrar el mapa: con permiso concedido y servicio encendido
  useEffect(() => {
    if (permission !== 'granted' || servicesEnabled !== true || hasLocation.current) return

    let cancelled = false
    let retryId = null

    const apply = (position) => {
      if (cancelled || !position || hasLocation.current) return
      hasLocation.current = true
      setLocation(toLatLng(position))
      setError(null)
    }

    // Primero la última posición conocida (instantánea); luego la actual, reintentando si falla
    const load = async () => {
      try {
        apply(await Location.getLastKnownPositionAsync())
      } catch (e) {
        // Sin posición previa: se continúa con la lectura actual
      }
      if (cancelled || hasLocation.current) return
      try {
        apply(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }))
      } catch (e) {
        if (cancelled) return
        setError(e)
        retryId = setTimeout(load, POSITION_RETRY_MS)
      }
    }

    load()
    return () => {
      cancelled = true
      if (retryId) clearTimeout(retryId)
    }
  }, [permission, servicesEnabled])

  // Pide el permiso de ubicación en primer plano; devuelve true o false
  const requestPermission = useCallback(async () => {
    try {
      const response = await Location.requestForegroundPermissionsAsync()
      const next = toPermission(response)
      setPermission(next)
      return next === 'granted'
    } catch (e) {
      setError(e)
      return false
    }
  }, [])

  // Seguimiento: solo mientras tracking sea true y el permiso esté concedido
  useEffect(() => {
    if (!tracking || permission !== 'granted') return undefined

    let cancelled = false
    let subscription = null

    const start = async () => {
      try {
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: UPDATE_INTERVAL_MS,
            distanceInterval: MIN_DISTANCE_METERS,
          },
          (position) => {
            hasLocation.current = true
            setLocation(toLatLng(position))
            setError(null)
          },
          (reason) => setError(new Error(String(reason)))
        )
        // Si el efecto ya se limpió mientras se creaba el observador, se detiene de inmediato
        if (cancelled) sub.remove()
        else subscription = sub
      } catch (e) {
        if (!cancelled) setError(e)
      }
    }

    start()

    // Limpieza: detiene el observador al pasar tracking a false o al desmontar
    return () => {
      cancelled = true
      if (subscription) subscription.remove()
    }
  }, [tracking, permission])

  return { location, permission, requestPermission, servicesEnabled, checkServices, error }
}

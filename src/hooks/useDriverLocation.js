// AI-assisted: see docs/AI_LOG.md #19
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import * as Location from 'expo-location'

// Este es el único archivo que importa expo-location.
// Si se cambia de librería de ubicación, solo debe cambiar este hook.

// AI-assisted: see docs/AI_LOG.md #21
// Frecuencia alta (Inicio enfocada): posiciones frecuentes para mover el auto con fluidez.
// timeInterval solo aplica en Android; en iOS manda distanceInterval.
const FAST_INTERVAL_MS = 1500
const FAST_DISTANCE_METERS = 3
// Frecuencia baja (disponible pero navegando por otra opción del menú): ahorra batería
const SLOW_INTERVAL_MS = 7000
const SLOW_DISTANCE_METERS = 12

// AI-assisted: see docs/AI_LOG.md #21
// Velocidad mínima en m/s para fiarse del rumbo del GPS (quieto, el GPS da rumbos erráticos)
const MIN_SPEED_MS = 1
// Distancia mínima en metros entre dos posiciones para calcular el rumbo por nuestra cuenta
const MIN_BEARING_DISTANCE_METERS = 4
const EARTH_RADIUS_METERS = 6371000
const toRadians = (degrees) => (degrees * Math.PI) / 180

// AI-assisted: see docs/AI_LOG.md #21
// Distancia en metros entre dos coordenadas (fórmula de haversine)
const distanceMeters = (a, b) => {
  const dLat = toRadians(b.latitude - a.latitude)
  const dLng = toRadians(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)))
}

// AI-assisted: see docs/AI_LOG.md #21
// Rumbo inicial en grados (0 a 360, desde el norte) al ir de la coordenada a hacia la b
const bearingDegrees = (a, b) => {
  const dLng = toRadians(b.longitude - a.longitude)
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

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

// Devuelve { location, heading, permission, requestPermission, servicesEnabled, checkServices, error }.
// location: solo { latitude, longitude }; heading (grados desde el norte) va aparte.
// watching = true, permiso concedido y servicio no apagado => mantiene un observador de la posición.
// lowRate = true usa la frecuencia baja del observador.
// servicesEnabled: null mientras se consulta, luego true o false (servicio de ubicación/GPS del teléfono).
export default function useDriverLocation({ watching, lowRate = false }) {
  const [location, setLocation] = useState(null)
  // AI-assisted: see docs/AI_LOG.md #21
  // Rumbo del auto; vale 0 hasta que haya movimiento real
  const [heading, setHeading] = useState(0)
  // Posición de referencia para calcular el rumbo. Vive en una referencia, y heading en el estado del hook,
  // así ambos se conservan cuando el observador se reinicia al cambiar de frecuencia.
  const bearingAnchor = useRef(null)
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

  // AI-assisted: see docs/AI_LOG.md #21
  // Procesa una posición del observador: actualiza location y, si hay movimiento real, el rumbo
  const handlePosition = useCallback((position) => {
    const next = toLatLng(position)
    const { heading: gpsHeading, speed } = position.coords
    const anchor = bearingAnchor.current
    const speedKnown = Number.isFinite(speed) && speed >= 0
    // Con velocidad desconocida solo decide la distancia; con velocidad conocida debe superar el mínimo
    const movingBySpeed = speedKnown && speed >= MIN_SPEED_MS

    let newHeading = null
    if (movingBySpeed && Number.isFinite(gpsHeading) && gpsHeading >= 0) {
      newHeading = gpsHeading % 360
    } else if (anchor && (movingBySpeed || !speedKnown) && distanceMeters(anchor, next) >= MIN_BEARING_DISTANCE_METERS) {
      newHeading = bearingDegrees(anchor, next)
    }

    // La referencia solo avanza cuando hay rumbo nuevo, así el ruido del GPS quieto no hace girar el auto
    if (newHeading !== null || !anchor) bearingAnchor.current = next
    if (newHeading !== null) setHeading(newHeading)

    hasLocation.current = true
    setLocation(next)
    setError(null)
  }, [])

  // Lee la posición actual una vez para centrar el mapa: con permiso concedido y servicio encendido
  useEffect(() => {
    if (permission !== 'granted' || servicesEnabled !== true || hasLocation.current) return

    let cancelled = false
    let retryId = null

    const apply = (position) => {
      if (cancelled || !position || hasLocation.current) return
      hasLocation.current = true
      if (!bearingAnchor.current) bearingAnchor.current = toLatLng(position)
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

  // AI-assisted: see docs/AI_LOG.md #21
  // Seguimiento: solo con watching, permiso concedido y el servicio no apagado (null = aún sin saber, se permite)
  useEffect(() => {
    if (!watching || permission !== 'granted' || servicesEnabled === false) return undefined

    let cancelled = false
    let subscription = null

    const start = async () => {
      try {
        const sub = await Location.watchPositionAsync(
          {
            // AI-assisted: see docs/AI_LOG.md #21
            // Con Inicio enfocada se usa GPS real (High) para que el auto se mueva con fluidez;
            // con frecuencia baja basta Balanced y se ahorra batería
            accuracy: lowRate ? Location.Accuracy.Balanced : Location.Accuracy.High,
            timeInterval: lowRate ? SLOW_INTERVAL_MS : FAST_INTERVAL_MS,
            distanceInterval: lowRate ? SLOW_DISTANCE_METERS : FAST_DISTANCE_METERS,
          },
          handlePosition,
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

    // Limpieza: detiene el observador al dejar de vigilar, al cambiar de frecuencia o al desmontar
    return () => {
      cancelled = true
      if (subscription) subscription.remove()
    }
  }, [watching, lowRate, permission, servicesEnabled, handlePosition])

  return { location, heading, permission, requestPermission, servicesEnabled, checkServices, error }
}

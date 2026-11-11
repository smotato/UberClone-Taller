// AI-assisted: see docs/AI_LOG.md #21

import React, { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { Marker } from 'react-native-maps'

// Imagen del auto: car_icon.png (1x), car_icon@2x.png y car_icon@3x.png en la carpeta assets.
// El tamaño en pantalla lo define el archivo 1x; la parte delantera del auto debe apuntar hacia arriba.
const CAR_IMAGE = require('../../assets/car_icon.png')

// Centro de la imagen: el auto gira sobre su propio centro
const ANCHOR = { x: 0.5, y: 0.5 }

// Por encima de los círculos y de otros elementos del mapa
const MARKER_Z_INDEX = 10

// Grados que se suman al rumbo si la parte delantera de tu imagen NO apunta hacia arriba
// (por ejemplo 90 si apunta a la derecha, 180 si apunta hacia abajo)
const HEADING_OFFSET = 0

// AI-assisted: see docs/AI_LOG.md #21
// Duración del deslizamiento (parecida al intervalo entre posiciones en pantalla) y del giro, en milisegundos
const MOVE_DURATION_MS = 1500
const ROTATION_DURATION_MS = 600

// Convierte el rumbo a un número entre 0 y 360. Si no es válido (vacío, negativo, no numérico) usa 0
const normalizeHeading = (heading) => {
  if (typeof heading !== 'number' || !Number.isFinite(heading) || heading < 0) return 0
  return (heading + HEADING_OFFSET) % 360
}

// Las coordenadas deben ser números finitos; con valores vacíos el mapa puede fallar
const isValidCoordinate = (coordinate) =>
  coordinate != null &&
  Number.isFinite(coordinate.latitude) &&
  Number.isFinite(coordinate.longitude)

// Auto del conductor sobre el mapa. Va como hijo de <MapView>.
// coordinate: { latitude, longitude } o null; heading: rumbo en grados desde el norte (opcional)
export default function DriverMarker({ coordinate, heading }) {
  // AI-assisted: see docs/AI_LOG.md #21
  const markerRef = useRef(null)
  // Coordenada con la que se crea el marcador; no cambia, los movimientos posteriores los anima el mapa
  const initialCoordinate = useRef(null)
  // Última coordenada recibida, para saber si hubo movimiento
  const lastCoordinate = useRef(null)
  // Ángulo continuo (puede superar 360 o ser negativo) para girar siempre por el camino más corto
  const angle = useRef(0)
  const rotationAnim = useRef(new Animated.Value(0)).current
  const [rotation, setRotation] = useState(0)

  const valid = isValidCoordinate(coordinate)
  const latitude = valid ? coordinate.latitude : null
  const longitude = valid ? coordinate.longitude : null
  if (valid && !initialCoordinate.current) initialCoordinate.current = { latitude, longitude }

  // AI-assisted: see docs/AI_LOG.md #21
  // Desliza el marcador a la nueva posición. La primera posición válida lo coloca sin animar.
  // animateMarkerToCoordinate existe en Android y en iOS con la nueva arquitectura (react-native-maps 1.29.11).
  useEffect(() => {
    if (!valid) return
    const next = { latitude, longitude }
    const last = lastCoordinate.current
    lastCoordinate.current = next
    if (!last) return
    if (last.latitude === latitude && last.longitude === longitude) return
    markerRef.current?.animateMarkerToCoordinate(next, MOVE_DURATION_MS)
  }, [valid, latitude, longitude])

  // AI-assisted: see docs/AI_LOG.md #21
  // La rotación del marcador no se anima de forma nativa, así que se interpola aquí y se pasa como prop
  useEffect(() => {
    const id = rotationAnim.addListener(({ value }) => setRotation(((value % 360) + 360) % 360))
    return () => {
      rotationAnim.removeListener(id)
      rotationAnim.stopAnimation()
    }
  }, [rotationAnim])

  // AI-assisted: see docs/AI_LOG.md #21
  // Gira por el camino más corto: de 359° a 0° avanza 1°, no 359° hacia atrás
  useEffect(() => {
    const target = normalizeHeading(heading)
    const delta = ((((target - angle.current) % 360) + 540) % 360) - 180
    if (Math.abs(delta) < 0.01) return
    angle.current += delta
    if (!valid) {
      // Sin marcador visible no hay nada que animar
      rotationAnim.setValue(angle.current)
      return
    }
    Animated.timing(rotationAnim, {
      toValue: angle.current,
      duration: ROTATION_DURATION_MS,
      useNativeDriver: false,
    }).start()
  }, [heading, valid, rotationAnim])

  // Sin ubicación todavía no se dibuja nada
  if (!valid) return null

  return (
    <Marker
      ref={markerRef}
      // AI-assisted: see docs/AI_LOG.md #21
      // La coordenada de la prop no cambia a propósito: el movimiento lo hace animateMarkerToCoordinate
      coordinate={initialCoordinate.current}
      image={CAR_IMAGE}
      anchor={ANCHOR}
      // Plano: gira junto con el mapa y apunta siempre a la dirección real
      flat
      rotation={rotation}
      zIndex={MARKER_Z_INDEX}
    />
  )
}
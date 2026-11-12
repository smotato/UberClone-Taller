// AI-assisted: see docs/AI_LOG.md #25
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { colors } from '../../theme/theme'
import DriverMarker from '../DriverMarker'
import RouteAttribution from './RouteAttribution'

// Margen de la ruta respecto a los bordes del mapa
const EDGE_PADDING = { top: 60, right: 60, bottom: 60, left: 60 }
// Zoom mínimo cuando solo hay un punto o puntos muy juntos
const MIN_DELTA = 0.01
// Región por defecto (Bogotá) si todavía no hay ninguna coordenada
const DEFAULT_REGION = { latitude: 4.711, longitude: -74.0721, latitudeDelta: 0.05, longitudeDelta: 0.05 }

const isPoint = (point) => point && Number.isFinite(point.lat) && Number.isFinite(point.lng)
const toLatLng = (point) => ({ latitude: point.lat, longitude: point.lng })

// Región que encuadra todas las coordenadas, para que el mapa abra bien antes de ajustar la cámara
const regionFor = (coordinates) => {
  if (coordinates.length === 0) return DEFAULT_REGION
  const lats = coordinates.map((c) => c.latitude)
  const lngs = coordinates.map((c) => c.longitude)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(MIN_DELTA, (maxLat - minLat) * 1.6),
    longitudeDelta: Math.max(MIN_DELTA, (maxLng - minLng) * 1.6),
  }
}

// Mapa del viaje en curso.
// - phase: 'pickup' (conductor -> recogida) o 'dropoff' (recogida -> destino)
// - pickup y destination: { lat, lng }; routePoints: puntos [{ lat, lng }] del tramo actual (vacío si no hay ruta)
// - driverLocation: { latitude, longitude } | null; heading: rumbo del auto
// Si el tramo no tiene ruta (sin llave, sin red o cuota agotada), dibuja una línea recta punteada de respaldo.
// Cuando se dibuja una ruta se muestra la atribución del proveedor.
export default function TripMap({ phase, pickup, destination, routePoints = [], driverLocation = null, heading = 0 }) {
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  const driverPoint = driverLocation
    ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
    : null

  // Extremos del tramo actual
  const from = phase === 'pickup' ? driverPoint : isPoint(pickup) ? pickup : null
  const to = phase === 'pickup' ? (isPoint(pickup) ? pickup : null) : isPoint(destination) ? destination : null

  const routeCoordinates = useMemo(() => routePoints.filter(isPoint).map(toLatLng), [routePoints])
  const hasRoute = routeCoordinates.length >= 2
  const fallbackLine = !hasRoute && isPoint(from) && isPoint(to) ? [toLatLng(from), toLatLng(to)] : null

  // Coordenadas que deben verse: la ruta si existe; si no, los extremos del tramo
  const fitCoordinates = hasRoute ? routeCoordinates : [from, to].filter(isPoint).map(toLatLng)
  const hasFrom = isPoint(from)

  // La cámara se ajusta al cambiar de tramo, al llegar la ruta o al conocerse el origen,
  // pero no en cada movimiento del auto (para no pelear con el usuario que mueve el mapa).
  // fitToCoordinates se llama después de onLayout, como recomienda la documentación de react-native-maps
  useEffect(() => {
    if (!mapReady || fitCoordinates.length < 2) return
    mapRef.current?.fitToCoordinates(fitCoordinates, { edgePadding: EDGE_PADDING, animated: true })
    // fitCoordinates se lee al ejecutarse el efecto; solo estos valores deben reajustar la cámara
  }, [mapReady, phase, hasRoute, routeCoordinates.length, hasFrom])

  // La región inicial solo se calcula una vez (después la cámara la mueve fitToCoordinates)
  const initialRegion = useMemo(() => regionFor(fitCoordinates), [])

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onLayout={() => setMapReady(true)}
      >
        {hasRoute ? (
          <Polyline coordinates={routeCoordinates} strokeColor={colors.primary} strokeWidth={5} />
        ) : fallbackLine ? (
          <Polyline coordinates={fallbackLine} strokeColor={colors.textSecondary} strokeWidth={3} lineDashPattern={[12, 10]} />
        ) : null}
        {isPoint(pickup) ? <Marker coordinate={toLatLng(pickup)} pinColor={colors.success} /> : null}
        {phase === 'dropoff' && isPoint(destination) ? (
          <Marker coordinate={toLatLng(destination)} pinColor={colors.error} />
        ) : null}
        <DriverMarker coordinate={driverLocation} heading={heading} />
      </MapView>
      {hasRoute ? <RouteAttribution /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
})

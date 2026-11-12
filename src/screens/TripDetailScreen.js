// AI-assisted: see docs/AI_LOG.md #23
import React, { useMemo, useRef } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { colors, spacing, radius, typography, shadows } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import { InfoRow } from '../components/profile/ProfileInfo'
// AI-assisted: see docs/AI_LOG.md #25
import RouteAttribution from '../components/trip/RouteAttribution'
import { formatTripDate } from '../components/history/TripItem'
import { formatCurrency } from '../utils/formatCurrency'
import { decodePolyline } from '../utils/polyline'
import { PAYMENT_METHOD_OPTIONS } from '../data/options'

// Margen de la ruta respecto a los bordes del mapa
const EDGE_PADDING = { top: 60, right: 60, bottom: 60, left: 60 }
// Zoom mínimo cuando solo hay un punto o puntos muy juntos
const MIN_DELTA = 0.01

const isCoordinate = (point) => point && Number.isFinite(point.lat) && Number.isFinite(point.lng)
const toLatLng = (point) => ({ latitude: point.lat, longitude: point.lng })

// Región que encuadra todas las coordenadas, para que el mapa abra bien aunque fitToCoordinates no alcance a ejecutarse
const regionFor = (coordinates) => {
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

// Detalle de un viaje: mapa con la ruta guardada (si la tiene) y todos los datos del cobro.
// Funciona si el viaje no trae ruta o si está mal formada: entonces no dibuja la línea
export default function TripDetailScreen({ route }) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en-US' : 'es-CO'
  const mapRef = useRef(null)
  const trip = route.params?.trip

  // Ruta decodificada; con un valor ausente, nulo o inválido queda vacía
  const routeCoordinates = useMemo(
    () => decodePolyline(trip?.route).map(toLatLng),
    [trip?.route]
  )
  const origin = isCoordinate(trip?.origin) ? toLatLng(trip.origin) : null
  const destination = isCoordinate(trip?.destination) ? toLatLng(trip.destination) : null

  // Con ruta se encuadra la ruta; sin ruta, los marcadores de origen y destino que existan
  const fitCoordinates = useMemo(
    () => (routeCoordinates.length >= 2 ? routeCoordinates : [origin, destination].filter(Boolean)),
    [routeCoordinates, origin, destination]
  )
  const hasMap = fitCoordinates.length > 0

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>{t('tripDetail.notFound')}</Text>
      </View>
    )
  }

  const methodOption = PAYMENT_METHOD_OPTIONS.find((option) => option.value === trip.paymentMethod)
  const rate = typeof trip.commissionRate === 'number' ? ` (${Math.round(trip.commissionRate * 100)}%)` : ''

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {hasMap ? (
          <View>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={regionFor(fitCoordinates)}
            // fitToCoordinates se llama desde onLayout, como recomienda la documentación de react-native-maps
            onLayout={() => {
              if (fitCoordinates.length >= 2) {
                mapRef.current?.fitToCoordinates(fitCoordinates, { edgePadding: EDGE_PADDING, animated: false })
              }
            }}
          >
            {routeCoordinates.length >= 2 ? (
              <Polyline coordinates={routeCoordinates} strokeColor={colors.primary} strokeWidth={4} />
            ) : null}
            {origin ? <Marker coordinate={origin} pinColor={colors.success} /> : null}
            {destination ? <Marker coordinate={destination} pinColor={colors.error} /> : null}
          </MapView>
          {/* AI-assisted: see docs/AI_LOG.md #25 */}
          {/* Atribución de los datos de la ruta, solo cuando se dibuja una ruta */}
          {routeCoordinates.length >= 2 ? <RouteAttribution /> : null}
          </View>
        ) : null}
        {routeCoordinates.length < 2 ? <Text style={styles.noRoute}>{t('tripDetail.noRoute')}</Text> : null}
      </View>

      <View style={styles.card}>
        <InfoRow label={t('tripDetail.date')} value={formatTripDate(trip.completedAt, locale)} />
        <InfoRow label={t('tripDetail.origin')} value={trip.origin?.address} />
        <InfoRow label={t('tripDetail.destination')} value={trip.destination?.address} />
        <InfoRow
          label={t('registration.vehicle.category')}
          value={trip.category ? t(`options.category.${trip.category}`) : null}
        />
        <InfoRow
          label={t('tripDetail.distance')}
          value={Number.isFinite(trip.distanceKm) ? `${trip.distanceKm} km` : null}
        />
        <InfoRow
          label={t('tripDetail.duration')}
          value={Number.isFinite(trip.durationMin) ? `${trip.durationMin} min` : null}
        />
        <InfoRow label={t('tripDetail.fare')} value={formatCurrency(trip.fare)} />
        {/* La comisión usa el porcentaje guardado en el viaje, no el actual de pricing.js */}
        <InfoRow label={t('tripDetail.commission')} value={`${formatCurrency(trip.commission)}${rate}`} />
        <InfoRow label={t('tripDetail.tip')} value={formatCurrency(trip.tip)} />
        <InfoRow label={t('tripDetail.earnings')} value={formatCurrency(trip.driverEarnings)} />
        <InfoRow
          label={t('tripDetail.paymentMethod')}
          value={methodOption ? t(methodOption.labelKey) : trip.paymentMethod}
        />
        <InfoRow
          label={t('tripDetail.paymentStatus')}
          value={trip.paymentStatus ? t(`paymentStatus.${trip.paymentStatus}`) : null}
        />
        <InfoRow
          label={t('tripDetail.rating')}
          value={Number.isFinite(trip.rating) ? `★ ${trip.rating}/5` : t('tripDetail.noRating')}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  map: {
    height: 260,
  },
  noRoute: {
    ...typography.caption,
    color: colors.textMuted,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  centerText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})

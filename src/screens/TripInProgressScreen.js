// AI-assisted: see docs/AI_LOG.md #25
import React, { useCallback, useEffect, useRef } from 'react'
import { View, Text, Pressable, Alert, BackHandler, StyleSheet } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'
import useTrip from '../hooks/useTrip'
import useDriverLocation from '../hooks/useDriverLocation'
import TripMap from '../components/trip/TripMap'

const isPoint = (point) => point && Number.isFinite(point.lat) && Number.isFinite(point.lng)

// Viaje en curso: mapa con la ruta del tramo actual y el botón del siguiente paso.
// Hacia la recogida (accepted y driver_arriving) -> "Pasajero a bordo"; con el pasajero a bordo (in_progress) -> "Finalizar viaje".
// Cada tramo de ruta se pide una sola vez; si el proveedor falla, el mapa dibuja una línea recta de respaldo y el viaje continúa.
export default function TripInProgressScreen() {
  const { t } = useLanguage()
  const insets = useSafeAreaInsets()
  const { driver } = useSession()
  const { activeTrip, legs, loadLeg, busy, startArriving, passengerOnBoard, finishTrip, cancelTrip } = useTrip()
  // Ubicación propia para mover el auto con fluidez; el envío a Firestore lo sigue haciendo Inicio
  const { location, heading } = useDriverLocation({ watching: true })

  const status = activeTrip?.status
  const phase = status === 'in_progress' ? 'dropoff' : 'pickup'
  const pickup = isPoint(activeTrip?.origin) ? activeTrip.origin : null
  const destination = isPoint(activeTrip?.destination) ? activeTrip.destination : null
  // Punto del conductor: la ubicación en vivo o, mientras llega, la última guardada en su documento
  const driverPoint = location
    ? { lat: location.latitude, lng: location.longitude }
    : isPoint(driver?.location) ? driver.location : null
  const hasDriverPoint = Boolean(driverPoint)

  // El botón atrás de Android no saca del viaje
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)
      return () => subscription.remove()
    }, [])
  )

  // Avisa un error de una acción del viaje
  const notifyFailure = useCallback((code) => {
    if (code === 'busy') return
    const unavailable = code === 'unavailable' || code === 'not_found' || code === 'not_yours'
    const key = unavailable ? 'request.unavailable' : 'tripFlow.transitionError'
    Alert.alert(t(`${key}Title`), t(key))
  }, [t])

  // Al llegar a la pantalla con el viaje aceptado, pasa solo a "hacia la recogida" (una vez por viaje).
  // Si falla, el botón principal permite reintentarlo
  const arrivingTriedRef = useRef(null)
  useEffect(() => {
    if (status !== 'accepted' || busy || arrivingTriedRef.current === activeTrip?.id) return
    arrivingTriedRef.current = activeTrip.id
    startArriving().then((result) => { if (!result.ok) notifyFailure(result.code) })
  }, [status, busy, activeTrip?.id, startArriving, notifyFailure])

  // Tramo conductor -> recogida: se pide una sola vez, cuando se conoce dónde está el conductor
  useEffect(() => {
    if (phase !== 'pickup' || !pickup || !driverPoint) return
    loadLeg('pickup', driverPoint, pickup)
  }, [phase, hasDriverPoint, pickup?.lat, pickup?.lng, activeTrip?.id])

  // Tramo recogida -> destino: se pide una sola vez, al subir el pasajero
  useEffect(() => {
    if (phase !== 'dropoff' || !pickup || !destination) return
    loadLeg('dropoff', pickup, destination)
  }, [phase, pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, activeTrip?.id])

  const leg = phase === 'pickup' ? legs.pickup : legs.dropoff

  // Siguiente paso del conductor según el estado del viaje
  const handlePrimary = useCallback(async () => {
    let result
    if (status === 'accepted') {
      result = await startArriving()
    } else if (status === 'driver_arriving') {
      result = await passengerOnBoard()
    } else if (status === 'in_progress') {
      // Los datos finales salen del tramo recogida -> destino si se pudo trazar; la ruta guardada es ese mismo tramo
      const ready = legs.dropoff.status === 'ready'
      result = await finishTrip({
        destinationLeg: ready ? { distanceKm: legs.dropoff.distanceKm, durationMin: legs.dropoff.durationMin } : null,
        routePoints: ready ? legs.dropoff.points : [],
      })
    } else {
      return
    }
    if (!result.ok) notifyFailure(result.code)
  }, [status, startArriving, passengerOnBoard, finishTrip, legs.dropoff, notifyFailure])

  const handleCancel = useCallback(() => {
    Alert.alert(t('tripFlow.cancelConfirm'), undefined, [
      { text: t('profile.cancel'), style: 'cancel' },
      {
        text: t('tripFlow.cancelTrip'),
        style: 'destructive',
        onPress: async () => {
          const result = await cancelTrip()
          if (!result.ok) notifyFailure(result.code)
        },
      },
    ])
  }, [t, cancelTrip, notifyFailure])

  if (!activeTrip) return <View style={styles.container} />

  const primaryKey = status === 'in_progress'
    ? 'tripFlow.finishTrip'
    : status === 'driver_arriving' ? 'tripFlow.passengerOnBoard' : 'tripFlow.startPickup'
  const target = phase === 'pickup' ? activeTrip.origin : activeTrip.destination
  const canCancel = status === 'accepted' || status === 'driver_arriving'

  return (
    <View style={styles.container}>
      <TripMap
        phase={phase}
        pickup={pickup}
        destination={destination}
        routePoints={leg.points}
        driverLocation={location}
        heading={heading}
      />

      <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.title}>{t(phase === 'pickup' ? 'tripFlow.toPickup' : 'tripFlow.toDestination')}</Text>
        {target?.address ? <Text style={styles.address} numberOfLines={2}>{target.address}</Text> : null}

        {/* Tiempo y distancia del tramo, o el aviso de que no se pudo trazar la ruta */}
        {leg.status === 'ready' ? (
          <Text style={styles.eta}>{`${leg.durationMin} min · ${leg.distanceKm} km`}</Text>
        ) : leg.status === 'loading' ? (
          <Text style={styles.eta}>{t('request.calculating')}</Text>
        ) : leg.status === 'failed' ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{t('tripFlow.routeUnavailable')}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed, busy && styles.disabled]}
          onPress={handlePrimary}
          disabled={busy}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>{t(primaryKey)}</Text>
        </Pressable>

        {canCancel ? (
          <Pressable style={[styles.secondaryButton, busy && styles.disabled]} onPress={handleCancel} disabled={busy} accessibilityRole="button">
            <Text style={styles.secondaryText}>{t('tripFlow.cancelTrip')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Panel inferior con el siguiente paso; el mapa ocupa el resto de la pantalla
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.sm,
    ...shadows.floating,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  address: {
    ...typography.body,
    color: colors.textSecondary,
  },
  eta: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  notice: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noticeText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  primaryButton: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  secondaryButton: {
    height: sizes.buttonHeight,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    ...typography.button,
    color: colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
})

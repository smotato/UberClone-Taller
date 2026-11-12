// AI-assisted: see docs/AI_LOG.md #25
import React, { useCallback, useMemo } from 'react'
import { View, Text, Pressable, ScrollView, Alert, BackHandler, StyleSheet } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useTrip from '../hooks/useTrip'
import useCountdown from '../hooks/useCountdown'
import LoadingOverlay from '../components/LoadingOverlay'
import { InfoRow } from '../components/profile/ProfileInfo'
import { calculateFare } from '../utils/calculateFare'
import { formatCurrency } from '../utils/formatCurrency'
import { REQUEST_TIMEOUT_SECONDS } from '../config/tripFlow'
import { PAYMENT_METHOD_OPTIONS } from '../data/options'

// Espera para que el overlay termine de ocultarse antes de mostrar el Alert (en iOS una alerta no aparece sobre un Modal abierto)
const ALERT_DELAY_MS = 400
// Debajo de estos segundos la cuenta regresiva se pone en rojo
const URGENT_SECONDS = 5
const TIMER_SIZE = 72

// Solicitud entrante: datos del viaje, tarifa y ganancia neta estimadas, y 15 segundos para aceptar o rechazar.
// Al llegar a cero la solicitud se rechaza sola.
export default function IncomingRequestScreen() {
  const { t } = useLanguage()
  const insets = useSafeAreaInsets()
  const { request, receivedAt, requestEstimate, accepting, rejecting, accept, reject } = useTrip()
  const busy = accepting || rejecting

  // El botón atrás de Android no saca de la solicitud: hay que aceptar, rechazar o dejar que venza
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)
      return () => subscription.remove()
    }, [])
  )

  // Distancia y duración: las de la solicitud o, si no las trae, las que calculó Distance Matrix
  const metrics = useMemo(() => {
    if (!request) return null
    if (Number.isFinite(request.distanceKm) && Number.isFinite(request.durationMin)) {
      return { distanceKm: request.distanceKm, durationMin: request.durationMin }
    }
    if (requestEstimate.id === request.id && requestEstimate.status === 'ready') return requestEstimate.value
    return null
  }, [request, requestEstimate])
  const calculating = !metrics && requestEstimate.id === request?.id && requestEstimate.status === 'loading'

  // Tarifa estimada y ganancia neta estimada, con la misma función que usa el cierre del viaje
  const fare = useMemo(() => {
    if (!metrics || !request) return null
    try {
      return calculateFare({ ...metrics, category: request.category, tip: 0 })
    } catch {
      return null
    }
  }, [metrics, request])

  // Avisa el error con un Alert después de ocultar el overlay
  const notifyFailure = useCallback((code, fallbackKey) => {
    const unavailable = code === 'unavailable' || code === 'not_found' || code === 'not_yours'
    setTimeout(() => Alert.alert(t(unavailable ? 'request.unavailable' : fallbackKey)), ALERT_DELAY_MS)
  }, [t])

  const handleAccept = useCallback(async () => {
    const result = await accept()
    if (!result.ok && result.code !== 'busy') notifyFailure(result.code, 'request.acceptError')
  }, [accept, notifyFailure])

  const handleReject = useCallback(async (reason) => {
    const result = await reject(reason)
    if (!result.ok && result.code !== 'busy') notifyFailure(result.code, 'request.rejectError')
  }, [reject, notifyFailure])

  // Al llegar a cero se rechaza sola
  const { secondsLeft } = useCountdown(REQUEST_TIMEOUT_SECONDS, () => handleReject('timeout'), receivedAt)

  const valueOrDash = (value, format) => (calculating ? t('request.calculating') : value === null || value === undefined ? '—' : format(value))
  const methodOption = PAYMENT_METHOD_OPTIONS.find((option) => option.value === request?.paymentMethod)
  const urgent = secondsLeft <= URGENT_SECONDS

  if (!request) return <View style={styles.container} />

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('request.title')}</Text>

        {/* Cuenta regresiva: número y barra que se vacía */}
        <View style={styles.timerRow}>
          <View style={[styles.timerCircle, urgent && styles.timerCircleUrgent]}>
            <Text style={styles.timerText}>{secondsLeft}</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                urgent && styles.fillUrgent,
                { width: `${Math.min(100, (secondsLeft / REQUEST_TIMEOUT_SECONDS) * 100)}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.card}>
          <InfoRow label={t('request.pickup')} value={request.origin?.address ?? '—'} />
          <InfoRow label={t('request.destination')} value={request.destination?.address ?? '—'} />
          <InfoRow label={t('request.distance')} value={valueOrDash(metrics?.distanceKm, (km) => `${km} km`)} />
          <InfoRow label={t('request.duration')} value={valueOrDash(metrics?.durationMin, (min) => `${min} min`)} />
          <InfoRow label={t('request.category')} value={request.category ? t(`options.category.${request.category}`) : '—'} />
          <InfoRow label={t('request.paymentMethod')} value={methodOption ? t(methodOption.labelKey) : request.paymentMethod ?? '—'} />
          <InfoRow label={t('request.estimatedFare')} value={valueOrDash(fare?.fare, formatCurrency)} />
          <InfoRow label={t('request.estimatedEarnings')} value={valueOrDash(fare?.driverEarnings, formatCurrency)} />
        </View>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={({ pressed }) => [styles.acceptButton, pressed && styles.acceptButtonPressed, busy && styles.disabled]}
          onPress={handleAccept}
          disabled={busy}
          accessibilityRole="button"
        >
          <Text style={styles.acceptText}>{t('request.accept')}</Text>
        </Pressable>
        <Pressable
          style={[styles.rejectButton, busy && styles.disabled]}
          onPress={() => handleReject('declined')}
          disabled={busy}
          accessibilityRole="button"
        >
          <Text style={styles.rejectText}>{t('request.reject')}</Text>
        </Pressable>
      </View>

      <LoadingOverlay visible={busy} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },

  // Cuenta regresiva
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  timerCircle: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircleUrgent: {
    backgroundColor: colors.error,
  },
  timerText: {
    ...typography.display,
    color: colors.textOnPrimary,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  fillUrgent: {
    backgroundColor: colors.error,
  },

  // Datos de la solicitud
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.card,
  },

  // Botones fijos abajo
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  acceptButton: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  acceptText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  rejectButton: {
    height: sizes.buttonHeight,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    ...typography.button,
    color: colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
})

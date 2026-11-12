// AI-assisted: see docs/AI_LOG.md #25
import React, { useCallback } from 'react'
import { View, Text, Pressable, ScrollView, Alert, BackHandler, StyleSheet } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useTrip from '../hooks/useTrip'
import LoadingOverlay from '../components/LoadingOverlay'
import { InfoRow } from '../components/profile/ProfileInfo'
import { PAYMENT_STATUS_STYLES } from '../components/history/TripItem'
import { formatCurrency } from '../utils/formatCurrency'
import { PAYMENT_METHOD_OPTIONS } from '../data/options'
// AI-assisted: see docs/AI_LOG.md #29
import { StripeProvider } from '@stripe/stripe-react-native'
import PayWithCardButton from '../components/trip/PayWithCardButton'
import { isPaymentsConfigured, STRIPE_PUBLISHABLE_KEY } from '../services/paymentsServices'

// Espera para que el overlay termine de ocultarse antes de mostrar el Alert (en iOS una alerta no aparece sobre un Modal abierto)
const ALERT_DELAY_MS = 400

// Cobro y resumen del viaje: tarifa final, comisión, propina, ganancia neta y estado del pago.
// - Efectivo: el conductor marca "Cobro recibido" y el viaje pasa a pagado (la comisión se descuenta del saldo).
// - Pasarela: sin backend todavía queda Pendiente; en desarrollo hay botones para simular la respuesta de la pasarela.
export default function TripSummaryScreen() {
  const { t } = useLanguage()
  const insets = useSafeAreaInsets()
  const { activeTrip, busy, collectCash, simulateGatewayResult, leaveSummary } = useTrip()

  // El botón atrás de Android no saca del resumen: hay que cobrar o volver al inicio
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)
      return () => subscription.remove()
    }, [])
  )

  // Avisa el error con un Alert después de ocultar el overlay
  const notifyFailure = useCallback((code) => {
    if (code === 'busy') return
    const unavailable = code === 'unavailable' || code === 'not_found' || code === 'not_yours'
    const key = unavailable ? 'request.unavailable' : 'tripFlow.transitionError'
    setTimeout(() => Alert.alert(t(`${key}Title`), t(key)), ALERT_DELAY_MS)
  }, [t])

  const handleCollectCash = useCallback(async () => {
    const result = await collectCash()
    if (!result.ok) notifyFailure(result.code)
  }, [collectCash, notifyFailure])

  const handleSimulate = useCallback(async (approved) => {
    const result = await simulateGatewayResult(approved)
    if (!result.ok) notifyFailure(result.code)
  }, [simulateGatewayResult, notifyFailure])

  if (!activeTrip) return <View style={styles.container} />

  const trip = activeTrip
  const isCash = trip.paymentMethod === 'cash'
  const isPaid = trip.status === 'paid'
  const statusStyle = PAYMENT_STATUS_STYLES[trip.paymentStatus] ?? PAYMENT_STATUS_STYLES.cash
  const methodOption = PAYMENT_METHOD_OPTIONS.find((option) => option.value === trip.paymentMethod)
  // La comisión se muestra con el porcentaje guardado en el viaje
  // AI-assisted: see docs/AI_LOG.md #29
  // Con Stripe y el servidor de pagos configurado, el cobro es con tarjeta; si no, queda la simulación de desarrollo
  const useCardPayment = trip.paymentMethod === 'stripe' && isPaymentsConfigured
  const rate = typeof trip.commissionRate === 'number' ? ` (${Math.round(trip.commissionRate * 100)}%)` : ''

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('tripSummary.title')}</Text>

        {/* Ganancia neta destacada y estado del pago */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{t('tripDetail.earnings')}</Text>
          <Text style={styles.heroAmount}>{formatCurrency(trip.driverEarnings)}</Text>
          {trip.paymentStatus ? (
            <View style={[styles.badge, { backgroundColor: statusStyle.background }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>{t(`paymentStatus.${trip.paymentStatus}`)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <InfoRow label={t('tripSummary.finalFare')} value={formatCurrency(trip.fare)} />
          <InfoRow label={t('tripDetail.commission')} value={`${formatCurrency(trip.commission)}${rate}`} />
          <InfoRow label={t('tripDetail.tip')} value={formatCurrency(trip.tip)} />
          <InfoRow label={t('tripDetail.earnings')} value={formatCurrency(trip.driverEarnings)} />
          <InfoRow label={t('tripDetail.paymentMethod')} value={methodOption ? t(methodOption.labelKey) : trip.paymentMethod} />
          <InfoRow label={t('tripDetail.distance')} value={Number.isFinite(trip.distanceKm) ? `${trip.distanceKm} km` : null} />
          <InfoRow label={t('tripDetail.duration')} value={Number.isFinite(trip.durationMin) ? `${trip.durationMin} min` : null} />
        </View>

        {/* Con pasarela y sin confirmación: aviso de espera */}
        {!isCash && !isPaid && !useCardPayment ? <Text style={styles.waiting}>{t('tripSummary.waitingGateway')}</Text> : null}
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Efectivo sin cobrar: el conductor marca el cobro recibido */}
        {isCash && !isPaid ? (
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed, busy && styles.disabled]}
            onPress={handleCollectCash}
            disabled={busy}
            accessibilityRole="button"
          >
            <Text style={styles.primaryText}>{t('tripSummary.collectCash')}</Text>
          </Pressable>
        ) : null}

        {/* AI-assisted: see docs/AI_LOG.md #29 */}
        {/* Tarjeta (Stripe): la hoja de pago de Stripe; el resultado lo confirma el servidor de pagos */}
        {useCardPayment && trip.status === 'completed' ? (
          <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <PayWithCardButton />
          </StripeProvider>
        ) : null}

        {/* Solo desarrollo: simula la respuesta de la pasarela cuando no hay servidor de pagos */}
        {__DEV__ && !isCash && !isPaid && !useCardPayment ? (
          <>
            <Pressable style={[styles.secondaryButton, busy && styles.disabled]} onPress={() => handleSimulate(true)} disabled={busy} accessibilityRole="button">
              <Text style={styles.secondaryText}>{t('dev.simulateApproved')}</Text>
            </Pressable>
            <Pressable style={[styles.secondaryButton, busy && styles.disabled]} onPress={() => handleSimulate(false)} disabled={busy} accessibilityRole="button">
              <Text style={styles.secondaryText}>{t('dev.simulateRejected')}</Text>
            </Pressable>
          </>
        ) : null}

        {/* Salir: tras cobrar, o con pasarela (el viaje queda en el historial con su estado de pago) */}
        {isPaid || !isCash ? (
          <Pressable
            style={({ pressed }) => [isPaid ? styles.primaryButton : styles.secondaryButton, isPaid && pressed && styles.primaryButtonPressed, busy && styles.disabled]}
            onPress={leaveSummary}
            disabled={busy}
            accessibilityRole="button"
          >
            <Text style={isPaid ? styles.primaryText : styles.secondaryText}>{t('tripSummary.backHome')}</Text>
          </Pressable>
        ) : null}
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
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroLabel: {
    ...typography.label,
    color: colors.textDisabled,
  },
  heroAmount: {
    ...typography.display,
    color: colors.textOnPrimary,
  },
  badge: {
    marginTop: spacing.sm,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.label,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.card,
  },
  waiting: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  primaryButton: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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

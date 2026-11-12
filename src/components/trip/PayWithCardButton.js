// AI-assisted: see docs/AI_LOG.md #29
import React, { useCallback, useRef } from 'react'
import { Pressable, Text, Alert, StyleSheet } from 'react-native'
import { useStripe, PaymentSheetError } from '@stripe/stripe-react-native'
import { colors, radius, typography, sizes } from '../../theme/theme'
import useLanguage from '../../hooks/useLanguage'
import useTrip from '../../hooks/useTrip'

// Espera para que el overlay termine de ocultarse antes de abrir la hoja de pago o mostrar una alerta
const UI_DELAY_MS = 400

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Identifica cada toque del botón: el servidor lo usa como clave de idempotencia (solo letras y números)
const newAttemptId = () => `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

// Botón "Pagar con tarjeta". Debe estar dentro de <StripeProvider> (los hooks de Stripe lo exigen).
// Flujo: pedir el cobro al servidor -> hoja de pago de Stripe -> pedir al servidor que confirme el resultado.
// La app nunca decide si el pago fue aprobado: el viaje se actualiza desde el servidor y llega por listenTrip.
export default function PayWithCardButton() {
  const { t } = useLanguage()
  const { busy, createCardPayment, confirmCardPayment } = useTrip()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  // También bloquea el botón mientras la hoja de pago está abierta (ahí el contexto no está ocupado)
  const runningRef = useRef(false)

  // Recibe la clave base: el título es `${key}Title` y la descripción es `key`
  const notify = useCallback((key) => {
    setTimeout(() => Alert.alert(t(`${key}Title`), t(key)), UI_DELAY_MS)
  }, [t])

  const failureKey = useCallback((code) => {
    if (code === 'unreachable' || code === 'timeout') return 'payment.serverUnreachable'
    if (code === 'not_payable' || code === 'trip_not_found') return 'payment.notPayable'
    return 'payment.providerError'
  }, [])

  const handlePress = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true
    try {
      const created = await createCardPayment(newAttemptId())
      if (!created.ok) {
        // 'busy': ya hay otra acción en curso; 'already_paid': el viaje se actualizará solo
        if (created.code !== 'busy' && created.code !== 'already_paid') notify(failureKey(created.code))
        return
      }

      await wait(UI_DELAY_MS)
      const init = await initPaymentSheet({
        merchantDisplayName: t('payment.merchantName'),
        paymentIntentClientSecret: created.clientSecret,
      })
      if (init.error) {
        notify('payment.providerError')
        return
      }

      const sheet = await presentPaymentSheet()
      const canceled = sheet.error?.code === PaymentSheetError.Canceled

      // Aunque la hoja se cierre cancelada o con error, se consulta el resultado: una tarjeta pudo ser rechazada
      // (la hoja sigue abierta tras un rechazo) o el pago pudo completarse justo antes de cerrar
      const confirmed = await confirmCardPayment(created.paymentIntentId)
      if (!confirmed.ok) {
        if (confirmed.code !== 'busy' && confirmed.code !== 'already_paid') notify(failureKey(confirmed.code))
        return
      }

      if (confirmed.status === 'rejected') notify('payment.rejected')
      else if (confirmed.status === 'pending' && !canceled) notify(sheet.error ? 'payment.providerError' : 'payment.pending')
    } finally {
      runningRef.current = false
    }
  }, [createCardPayment, confirmCardPayment, initPaymentSheet, presentPaymentSheet, notify, failureKey, t])

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed, busy && styles.disabled]}
      onPress={handlePress}
      disabled={busy}
      accessibilityRole="button"
    >
      <Text style={styles.text}>{t('payment.payWithCard')}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.primaryPressed,
  },
  text: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  disabled: {
    opacity: 0.5,
  },
})

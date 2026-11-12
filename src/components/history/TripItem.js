// AI-assisted: see docs/AI_LOG.md #23
import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography, shadows } from '../../theme/theme'
import useLanguage from '../../hooks/useLanguage'
import { formatCurrency } from '../../utils/formatCurrency'

// Fecha y hora de un viaje según el idioma; devuelve null si la marca de tiempo no es válida
export const formatTripDate = (ms, locale) => {
  const date = new Date(ms)
  if (!ms || Number.isNaN(date.getTime())) return null
  const day = date.toLocaleDateString(locale)
  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  return `${day} ${time}`
}

// Colores de la etiqueta del estado del pago
const STATUS_STYLES = {
  approved: { background: colors.successSoft, text: colors.success },
  pending: { background: colors.warningSoft, text: colors.textSecondary },
  rejected: { background: colors.errorSoft, text: colors.error },
  cash: { background: colors.surfaceMuted, text: colors.textSecondary },
}

// Un elemento del Historial: fecha y hora, origen → destino, categoría, tarifa, ganancia neta y estado del pago
export default function TripItem({ trip, onPress }) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en-US' : 'es-CO'
  const statusStyle = STATUS_STYLES[trip.paymentStatus] ?? STATUS_STYLES.cash

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(trip)}
      accessibilityRole="button"
    >
      <View style={styles.topRow}>
        <Text style={styles.date}>{formatTripDate(trip.completedAt, locale) ?? ''}</Text>
        {trip.paymentStatus ? (
          <View style={[styles.badge, { backgroundColor: statusStyle.background }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {t(`paymentStatus.${trip.paymentStatus}`)}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.route} numberOfLines={2}>
        {trip.origin?.address ?? '—'} → {trip.destination?.address ?? '—'}
      </Text>
      <Text style={styles.category}>
        {trip.category ? t(`options.category.${trip.category}`) : ''}
      </Text>

      <View style={styles.amounts}>
        <View>
          <Text style={styles.amountLabel}>{t('tripDetail.fare')}</Text>
          <Text style={styles.amount}>{formatCurrency(trip.fare)}</Text>
        </View>
        <View style={styles.amountRight}>
          <Text style={styles.amountLabel}>{t('tripDetail.earnings')}</Text>
          <Text style={styles.amount}>{formatCurrency(trip.driverEarnings)}</Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.label,
    color: colors.textSecondary,
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  route: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  category: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  amount: {
    ...typography.bodyStrong,
    color: colors.text,
  },
})

// AI-assisted: see docs/AI_LOG.md #23
import React from 'react'
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography, shadows, sizes } from '../../theme/theme'
import useLanguage from '../../hooks/useLanguage'
import { formatCurrency } from '../../utils/formatCurrency'

// Tarjeta del saldo del conductor: ganancias de la pasarela menos comisiones en efectivo.
// Si el cálculo falla muestra el error completo con Reintentar, nunca un total parcial.
export default function BalanceCard({ balance, loading, error, mismatch, onRetry }) {
  const { t } = useLanguage()

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('earnings.balance')}</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{t('earnings.balanceError')}</Text>
          <Pressable style={styles.retryButton} onPress={onRetry} accessibilityRole="button">
            <Text style={styles.retryText}>{t('earnings.retry')}</Text>
          </Pressable>
        </View>
      ) : loading && balance === null ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <>
          {/* Un saldo negativo (más efectivo que pasarela) se muestra en rojo */}
          <Text style={[styles.amount, balance < 0 && styles.amountNegative]}>
            {formatCurrency(balance)}
          </Text>
          <Text style={styles.hint}>{t('earnings.balanceHint')}</Text>
          {mismatch ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>{t('earnings.balanceMismatch')}</Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.card,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  amount: {
    ...typography.display,
    color: colors.text,
    marginTop: spacing.sm,
  },
  amountNegative: {
    color: colors.error,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  warningBox: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  warningText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  errorBox: {
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.label,
    color: colors.error,
  },
  retryButton: {
    height: sizes.buttonHeight - 12,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    ...typography.label,
    color: colors.textOnPrimary,
  },
})

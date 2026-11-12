// AI-assisted: see docs/AI_LOG.md #23
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography, shadows } from '../../theme/theme'
import useLanguage from '../../hooks/useLanguage'
import { formatCurrency } from '../../utils/formatCurrency'

// Fila de etiqueta a la izquierda y valor a la derecha
function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

// Tarjeta de un periodo (hoy, semana o mes) con los seis datos de Ganancias.
// summary = { count, billed, commissions, tips, net, average }
export default function PeriodCard({ title, summary }) {
  const { t } = useLanguage()

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.net}>{formatCurrency(summary.net)}</Text>
      <Text style={styles.netLabel}>{t('earnings.net')}</Text>

      <View style={styles.rows}>
        <Row label={t('earnings.trips')} value={String(summary.count)} />
        <Row label={t('earnings.billed')} value={formatCurrency(summary.billed)} />
        <Row label={t('earnings.commissions')} value={formatCurrency(summary.commissions)} />
        <Row label={t('earnings.tips')} value={formatCurrency(summary.tips)} />
        <Row label={t('earnings.average')} value={formatCurrency(summary.average)} />
      </View>
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
  net: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.sm,
  },
  netLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  rows: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodyStrong,
    color: colors.text,
  },
})

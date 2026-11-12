// AI-assisted: see docs/AI_LOG.md #23
import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography } from '../../theme/theme'
import useLanguage from '../../hooks/useLanguage'
import DateField from '../forms/DateField'
import { PERIOD_OPTIONS, PAYMENT_METHOD_OPTIONS } from '../../data/options'

// Chip seleccionable (píldora): negro cuando está activo
function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  )
}

// Filtros del Historial: periodo (Hoy, Semana, Mes, Rango) y método de pago.
// Con "Rango" aparecen los dos selectores de fecha; los errores van debajo de cada campo
export default function HistoryFilters({
  period,
  onPeriodChange,
  paymentMethod,
  onPaymentMethodChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  errors = {},
}) {
  const { t } = useLanguage()

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        {PERIOD_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={t(option.labelKey)}
            selected={period === option.value}
            onPress={() => onPeriodChange(option.value)}
          />
        ))}
      </View>

      {period === 'custom' ? (
        <View style={styles.dates}>
          <DateField
            label={t('history.from')}
            placeholder={t('history.selectDate')}
            value={customFrom}
            maximumDate={new Date()}
            onChange={onCustomFromChange}
            error={errors.from}
          />
          <DateField
            label={t('history.to')}
            placeholder={t('history.selectDate')}
            value={customTo}
            maximumDate={new Date()}
            onChange={onCustomToChange}
            error={errors.to}
          />
        </View>
      ) : null}

      <View style={styles.chips}>
        {PAYMENT_METHOD_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={t(option.labelKey)}
            selected={paymentMethod === option.value}
            onPress={() => onPaymentMethodChange(option.value)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.label,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.textOnPrimary,
  },
  dates: {
    marginTop: spacing.xs,
  },
})

// AI-assisted: see docs/AI_LOG.md #6

import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import useLanguage from '../../hooks/useLanguage'
import { colors, spacing, radius, typography, sizes } from '../../theme/theme'

// Fecha que muestra el selector la primera vez, antes de que el usuario elija
const DEFAULT_PICKER_DATE = new Date(2000, 0, 1)

export default function DateField({
  label,
  placeholder,
  value,
  onChange,
  maximumDate,
  minimumDate,
  error,
}) {
  const { t } = useLanguage();
  const [showPicker, setShowPicker] = useState(false)

  const handleChange = (event, selectedDate) => {
    // En Android el selector es un diálogo y se cierra siempre al responder
    if (Platform.OS === 'android') setShowPicker(false)
    // 'dismissed' significa que el usuario canceló: no se cambia nada
    if (event.type === 'dismissed' || !selectedDate) return
    onChange(selectedDate)
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      {/* Borde rojo cuando el campo tiene error */}
      <Pressable
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value ? value.toLocaleDateString() : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={sizes.iconSm} color={colors.textMuted} />
      </Pressable>

      {/* Mensaje de error debajo del campo */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showPicker && (
        <DateTimePicker
          value={value ?? DEFAULT_PICKER_DATE}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      )}

      {/* En iOS el selector queda abierto dentro de la pantalla; este botón lo cierra */}
      {showPicker && Platform.OS === 'ios' && (
        <Pressable style={styles.doneButton} onPress={() => setShowPicker(false)}>
          <Text style={styles.doneText}>{t('common.done')}</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: sizes.inputHeight,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Borde rojo cuando el campo tiene error
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  valueText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
  },
  doneText: {
    ...typography.label,
    color: colors.accent,
  },
})
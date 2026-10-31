// AI-assisted: see docs/AI_LOG.md #9

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, typography } from '../../theme/theme'

// Tamaño del cuadro del checkbox
const BOX_SIZE = 24

export default function CheckboxField({ label, value, onChange, error }) {
  return (
    <View style={styles.field}>
      {/* Toda la fila es tocable, no solo el cuadro, para que sea fácil de presionar */}
      <Pressable
        style={styles.row}
        onPress={() => onChange(!value)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value }}
      >
        <View style={[styles.box, value && styles.boxChecked, error && styles.boxError]}>
          {value && <Ionicons name="checkmark" size={18} color={colors.textOnPrimary} />}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  // Cuadro vacío: borde gris y fondo blanco
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Cuadro marcado: relleno negro, como en Uber
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  // Borde rojo cuando hay error y el cuadro no está marcado
  boxError: {
    borderColor: colors.error,
  },
  label: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
})
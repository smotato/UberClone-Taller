// AI-assisted: see docs/AI_LOG.md #22
import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography, shadows, sizes } from '../../theme/theme'
import useLanguage from '../../hooks/useLanguage'
import LoadingOverlay from '../LoadingOverlay'

// Tarjeta de una sección del perfil: título, botón Editar y, en edición, Guardar / Cancelar.
// Si no recibe onEdit (p. ej. el vehículo) no muestra el botón Editar
export default function ProfileSection({
  title,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  editDisabled = false,
  canSave = false,
  saving = false,
  message = null,
  children,
}) {
  const { t } = useLanguage()

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onEdit && !isEditing ? (
          <Pressable
            style={[styles.editButton, editDisabled && styles.editButtonDisabled]}
            onPress={onEdit}
            disabled={editDisabled}
            accessibilityRole="button"
          >
            <Text style={[styles.editText, editDisabled && styles.editTextDisabled]}>{t('profile.edit')}</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Aviso breve de éxito; desaparece solo */}
      {message?.type === 'success' ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{message.text}</Text>
        </View>
      ) : null}

      {/* Aviso de error no bloqueante (p. ej. el idioma no se pudo guardar en la cuenta) */}
      {message?.type === 'error' ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{message.text}</Text>
        </View>
      ) : null}

      {children}

      {isEditing ? (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              !canSave && styles.saveButtonDisabled,
              pressed && canSave && styles.saveButtonPressed,
            ]}
            onPress={onSave}
            disabled={!canSave || saving}
            accessibilityRole="button"
          >
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>{t('profile.save')}</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={onCancel} disabled={saving} accessibilityRole="button">
            <Text style={styles.cancelText}>{t('profile.cancel')}</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Cubre la pantalla mientras se guarda */}
      <LoadingOverlay visible={saving} />
    </View>
  )
}

const styles = StyleSheet.create({
  // Misma tarjeta que usaba el perfil de solo lectura
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },

  // Botón Editar pequeño con borde
  editButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  editButtonDisabled: {
    opacity: 0.4,
  },
  editText: {
    ...typography.label,
    color: colors.text,
  },
  editTextDisabled: {
    color: colors.textDisabled,
  },

  // Aviso de éxito
  successBox: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.label,
    color: colors.success,
  },

  // Aviso de error
  errorBox: {
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.label,
    color: colors.error,
  },

  // Botones de edición
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  saveButton: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  saveButtonDisabled: {
    backgroundColor: colors.disabledBackground,
  },
  saveText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  saveTextDisabled: {
    color: colors.textDisabled,
  },
  cancelButton: {
    height: sizes.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
})

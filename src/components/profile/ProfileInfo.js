// AI-assisted: see docs/AI_LOG.md #22
import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, typography } from '../../theme/theme'

// Tamaño de las miniaturas de fotos (no existe en el tema)
const THUMB_SIZE = 72

// Convierte un valor de fecha de Firestore (con toDate(), número o texto) en texto; devuelve null si no hay valor
export const formatDate = (value, locale) => {
  if (!value) return null
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(locale)
}

// Fila de etiqueta y valor; no se muestra si no hay valor.
// locked agrega un candado; badge agrega una etiqueta (p. ej. "Vencido")
export function InfoRow({ label, value, locked = false, badge = null }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <View style={styles.row}>
      <View style={styles.labelLine}>
        <Text style={styles.rowLabel}>{label}</Text>
        {locked ? <Ionicons name="lock-closed" size={12} color={colors.textMuted} /> : null}
      </View>
      <View style={styles.valueLine}>
        <Text style={styles.rowValue}>{String(value)}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

// Foto en miniatura con su etiqueta; no se muestra si no hay URL
export function PhotoThumb({ label, uri, locked = false }) {
  if (!uri) return null
  return (
    <View style={styles.thumbItem}>
      <Image source={{ uri }} style={styles.thumb} />
      <View style={styles.labelLine}>
        <Text style={styles.thumbLabel} numberOfLines={2}>{label}</Text>
        {locked ? <Ionicons name="lock-closed" size={12} color={colors.textMuted} /> : null}
      </View>
    </View>
  )
}

// Nota pequeña bajo los datos bloqueados
export function LockedNote({ text }) {
  return <Text style={styles.note}>{text}</Text>
}

export const thumbRowStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.md,
  marginBottom: spacing.sm,
}

const styles = StyleSheet.create({
  // Filas de etiqueta y valor
  row: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  labelLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  valueLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowValue: {
    ...typography.body,
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.errorSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    ...typography.caption,
    color: colors.error,
  },

  // Miniaturas de fotos
  thumbItem: {
    width: THUMB_SIZE,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  thumbLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    flexShrink: 1,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
})

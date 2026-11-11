import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'

// Pantalla provisional: aún no hay viajes, así que solo muestra el mensaje vacío
export default function HistoryScreen() {
  const { t } = useLanguage()

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="time-outline" size={sizes.iconLg} color={colors.textMuted} />
        <Text style={styles.title}>{t('history.title')}</Text>
        <Text style={styles.message}>{t('history.empty')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Contenedor general; centra la tarjeta
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },

  // Tarjeta con el mensaje vacío
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})

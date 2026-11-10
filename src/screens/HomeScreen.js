// AI-assisted: see docs/AI_LOG.md #18

import React, { useState } from 'react'
import { View, Text, Pressable, Switch, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'

// Aviso según el estado del conductor: fondo suave, color del ícono/texto y texto traducido
const STATUS_NOTICES = {
  approved: { background: colors.successSoft, color: colors.success, icon: 'checkmark-circle', textKey: 'home.statusApproved' },
  pending:  { background: colors.warningSoft, color: colors.text,    icon: 'time',             textKey: 'home.statusPending' },
  rejected: { background: colors.errorSoft,   color: colors.error,   icon: 'close-circle',     textKey: 'home.statusRejected' },
}

export default function HomeScreen() {
  const { t } = useLanguage()
  const { driver, driverStatus, isApproved, logout } = useSession()
  const insets = useSafeAreaInsets()

  // Disponibilidad solo en memoria; guardarla queda para el siguiente entregable
  const [available, setAvailable] = useState(false)

  const firstName = (driver?.fullName ?? '').trim().split(/\s+/)[0]
  const notice = STATUS_NOTICES[driverStatus]

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.headerOverline}>{t('general.driver')}</Text>
        <Text style={styles.headerTitle}>UberClone</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('home.greeting')}, {firstName}</Text>

          {notice ? (
            <View style={[styles.notice, { backgroundColor: notice.background }]}>
              <Ionicons name={notice.icon} size={sizes.iconMd} color={notice.color} />
              <Text style={[styles.noticeText, { color: notice.color }]}>{t(notice.textKey)}</Text>
            </View>
          ) : null}

          <View style={styles.availabilityRow}>
            <Text style={styles.label}>
              {available ? t('home.available') : t('home.unavailable')}
            </Text>
            <Switch
              value={available}
              onValueChange={setAvailable}
              disabled={!isApproved}
              trackColor={{ false: colors.borderStrong, true: colors.success }}
              thumbColor={colors.surface}
            />
          </View>
          {!isApproved ? (
            <Text style={styles.hint}>{t('home.availabilityBlocked')}</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={logout}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{t('home.logout')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  // Contenedor general de la pantalla
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Cabecera negra; el paddingTop se suma en línea con insets.top
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerOverline: {
    ...typography.overline,
    color: colors.textDisabled,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    ...typography.display,
    color: colors.textOnPrimary,
  },

  // Espacio alrededor de la tarjeta dentro del scroll
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  // Tarjeta principal
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.card,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xl,
  },

  // Aviso del estado de la cuenta
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
  },
  noticeText: {
    ...typography.bodyStrong,
    flex: 1,
  },

  // Interruptor de disponibilidad
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.subtitle,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },

  // Botón de cerrar sesión: píldora con borde para diferenciarlo del principal
  button: {
    height: sizes.buttonHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  buttonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
  },
})

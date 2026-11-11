// AI-assisted: see docs/AI_LOG.md #19
import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'

// Insignia según el estado del conductor; mismos colores que el aviso de Inicio
const STATUS_BADGES = {
  approved: { background: colors.successSoft, color: colors.success, icon: 'checkmark-circle', textKey: 'home.statusApproved' },
  pending:  { background: colors.warningSoft, color: colors.text,    icon: 'time',             textKey: 'home.statusPending' },
  rejected: { background: colors.errorSoft,   color: colors.error,   icon: 'close-circle',     textKey: 'home.statusRejected' },
}

// Contenido del Drawer: datos del conductor arriba, opciones en medio y cerrar sesión al final
export default function DriverDrawerContent(props) {
  const { t } = useLanguage()
  const { driver, driverStatus, logout } = useSession()
  const insets = useSafeAreaInsets()

  const badge = STATUS_BADGES[driverStatus]
  const vehicle = driver?.vehicle
  const vehicleText = vehicle
    ? [[vehicle.brand, vehicle.model].filter(Boolean).join(' '), vehicle.plate].filter(Boolean).join(' · ')
    : ''

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Foto, nombre, vehículo y estado */}
        <View style={styles.profile}>
          {driver?.profilePhotoURL ? (
            <Image source={{ uri: driver.profilePhotoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={sizes.iconLg} color={colors.textOnPrimary} />
            </View>
          )}
          <Text style={styles.name} numberOfLines={1}>{driver?.fullName}</Text>
          {vehicleText ? <Text style={styles.vehicle} numberOfLines={1}>{vehicleText}</Text> : null}
          {badge ? (
            <View style={[styles.badge, { backgroundColor: badge.background }]}>
              <Ionicons name={badge.icon} size={sizes.iconSm} color={badge.color} />
              <Text style={[styles.badgeText, { color: badge.color }]} numberOfLines={1}>{t(badge.textKey)}</Text>
            </View>
          ) : null}
        </View>

        {/* Opciones del Drawer */}
        <View style={styles.items}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Cerrar sesión, separado por una línea */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <DrawerItem
          label={t('drawer.logout')}
          icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
          onPress={logout}
          inactiveTintColor={colors.text}
          labelStyle={styles.logoutLabel}
          style={styles.logoutItem}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Contenedor general
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },

  // Datos del conductor
  profile: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  avatar: {
    width: sizes.avatarLg,
    height: sizes.avatarLg,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.title,
    color: colors.text,
  },
  vehicle: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  badgeText: {
    ...typography.label,
  },

  // Lista de opciones
  items: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },

  // Pie con cerrar sesión
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  logoutItem: {
    borderRadius: radius.md,
  },
  logoutLabel: {
    ...typography.bodyStrong,
  },
})

// AI-assisted: see docs/AI_LOG.md #13

import React, { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useLanguage from '../hooks/useLanguage'
import useRegistration from '../hooks/useRegistration'
import { buildDriver } from '../utils/buildDriver'
import { addDriver, idNumberExists, newDriverId } from '../services/dbServices'
import {
  uploadProfilePhoto,
  uploadVehiclePhoto,
  uploadLicensePhoto,
  uploadSoatPhoto,
  uploadInspectionPhoto,
} from '../services/storageServices'
import { colors, spacing, radius, typography, sizes } from '../theme/theme'

// Clave de cada ruta -> clave de traducción de la etiqueta corta
const TAB_LABELS = {
  PersonalData: 'registration.tabsShort.personal',
  Vehicle: 'registration.tabsShort.vehicle',
  Documents: 'registration.tabsShort.documents',
}

export default function RegistrationTabBar({ state, navigation }) {
  const { t } = useLanguage()
  const insets = useSafeAreaInsets()
  const { data, isPersonalValid, isVehicleValid, isDocumentsValid, isRegistrationValid } = useRegistration()
  const [ sending, setSending ] = useState(false)

  // Una pestaña está completa cuando todos sus campos son válidos
  const completed = {
    PersonalData: isPersonalValid,
    Vehicle: isVehicleValid,
    Documents: isDocumentsValid,
  }
  const doneCount = Object.values(completed).filter(Boolean).length
  const total = state.routes.length
  // Navegación con flechas: pestaña anterior y siguiente según la posición actual
  const hasPrev = state.index > 0
  const hasNext = state.index < total - 1
  const goTo = (index) => navigation.navigate(state.routes[index].name)

  const handleSubmit = async () => {
    if (sending) return;

    setSending(true)
    try {
      // El ID es automático, así que se evita el registro duplicado consultando por documento
      if (await idNumberExists(data.idNumber)) {
        Alert.alert(t('registration.submitErrorTitle'), t('registration.duplicateId'))
        return
      }
      // El ID se genera antes para usarlo en la ruta de Storage (drivers/<id>/...)
      const newId = newDriverId()
      const driver = buildDriver(data)
      // Se suben las fotos en paralelo y se guardan las URL (no las uri locales del teléfono)
      const [profileURL, vehicleURL, licenseURL, soatURL, inspectionURL] = await Promise.all([
        uploadProfilePhoto(newId, data.profilePhoto),
        uploadVehiclePhoto(newId, data.vehiclePhoto),
        uploadLicensePhoto(newId, data.licensePhoto),
        uploadSoatPhoto(newId, data.soatPhoto),
        uploadInspectionPhoto(newId, data.inspectionPhoto),
      ])
      driver.profilePhotoURL = profileURL
      driver.vehicle.vehiclePhotoURL = vehicleURL
      driver.documents.licensePhotoURL = licenseURL
      driver.documents.soatPhotoURL = soatURL
      driver.documents.inspectionPhotoURL = inspectionURL
      const driverId = await addDriver(driver, newId)
      // TODO: guardar driverId en AsyncStorage como sesión
      Alert.alert(t('registration.submittedTitle'), t('registration.submittedMessage'))
    } catch (error) {
      Alert.alert(t('registration.submitErrorTitle'), t('registration.submitErrorMessage'))
    } finally {
      setSending(false)
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.sm }]}>
      {/* Barra de progreso: un segmento por pestaña, verde cuando está completa */}
      <View style={styles.progressRow}>
        <View style={styles.segments}>
          {state.routes.map((route) => (
            <View
              key={route.key}
              style={[styles.segment, completed[route.name] && styles.segmentDone]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          {doneCount}/{total} {t('registration.stepsCompleted')}
        </Text>
      </View>

      {/* Botón fijo: gris hasta que las 3 pestañas sean válidas */}
      <Pressable
        style={({ pressed }) => [
          styles.submit,
          !isRegistrationValid && styles.submitDisabled,
          pressed && isRegistrationValid && styles.submitPressed,
        ]}
        disabled={!isRegistrationValid || sending}
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isRegistrationValid }}
      >
        <Text style={[styles.submitText, !isRegistrationValid && styles.submitTextDisabled]}>
          {t('common.submit')}
        </Text>
      </Pressable>

      {/* Fila inferior: flecha atrás, pestañas numeradas y flecha siguiente */}
      <View style={styles.tabsRow}>
        {hasPrev ? (
          <Pressable
            style={[styles.navButton, styles.navButtonArrow]}
            onPress={() => goTo(state.index - 1)}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Ionicons name="arrow-back" size={sizes.iconMd} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.navPlaceholder} />
        )}

        {/* Pestañas numeradas; el check verde indica que la pestaña está completa */}
        <View style={styles.tabs}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index
            const isDone = completed[route.name]

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params)
              }
            }

            return (
              <Pressable
                key={route.key}
                style={styles.tab}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
              >
                <View
                  style={[
                    styles.circle,
                    isFocused && styles.circleActive,
                    isDone && styles.circleDone,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={sizes.iconSm} color={colors.textOnPrimary} />
                  ) : (
                    <Text style={[styles.circleText, isFocused && styles.circleTextActive]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]} numberOfLines={1}>
                  {t(TAB_LABELS[route.name])}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {hasNext ? (
          <Pressable
            style={[styles.navButton, styles.navButtonArrow]}
            onPress={() => goTo(state.index + 1)}
            accessibilityRole="button"
            accessibilityLabel={t('common.next')}
          >
            <Ionicons name="arrow-forward" size={sizes.iconMd} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.navPlaceholder} />
        )}
      </View>
    </View>
  )
}

const CIRCLE_SIZE = 28
const NAV_SIZE = 44

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  // Barra de progreso
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  segmentDone: {
    backgroundColor: colors.success,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Botón enviar
  submit: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  submitDisabled: {
    backgroundColor: colors.disabledBackground,
  },
  submitPressed: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.92,
  },
  submitText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  submitTextDisabled: {
    color: colors.textDisabled,
  },

  // Pestañas
    // Fila con las flechas a los lados y las pestañas en el centro
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
  },

  // Flechas de navegación
  navButton: {
    width: NAV_SIZE,
    height: NAV_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonArrow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  // Reserva el espacio de la flecha que no se muestra, para que las pestañas no se muevan
  navPlaceholder: {
    width: NAV_SIZE,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  circleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  // Completa: verde, aunque sea la pestaña activa
  circleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  circleText: {
    ...typography.label,
    color: colors.textMuted,
  },
  circleTextActive: {
    color: colors.textOnPrimary,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
  },
})
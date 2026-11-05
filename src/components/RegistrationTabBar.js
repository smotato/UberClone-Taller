// AI-assisted: see docs/AI_LOG.md #13

import React from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useLanguage from '../hooks/useLanguage'
import useRegistration from '../hooks/useRegistration'
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
  const { isPersonalValid, isVehicleValid, isDocumentsValid, isRegistrationValid } = useRegistration()

  // Una pestaña está completa cuando todos sus campos son válidos
  const completed = {
    PersonalData: isPersonalValid,
    Vehicle: isVehicleValid,
    Documents: isDocumentsValid,
  }
  const doneCount = Object.values(completed).filter(Boolean).length
  const total = state.routes.length

  const handleSubmit = () => {
    // TODO: enviar a Firebase con estado "pendiente de aprobación" (siguiente entregable)
    Alert.alert(t('registration.submittedTitle'), t('registration.submittedMessage'))
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
        disabled={!isRegistrationValid}
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isRegistrationValid }}
      >
        <Text style={[styles.submitText, !isRegistrationValid && styles.submitTextDisabled]}>
          {t('common.submit')}
        </Text>
      </Pressable>

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
    </View>
  )
}

const CIRCLE_SIZE = 28

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
  tabs: {
    flexDirection: 'row',
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
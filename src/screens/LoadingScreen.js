// AI-assisted: see docs/AI_LOG.md #18

import React from 'react'
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'

export default function LoadingScreen() {
  const { t } = useLanguage()
  const { bootstrapError, retryBootstrap } = useSession()

  return (
    <View style={styles.container}>
      {bootstrapError ? (
        <>
          <Text style={styles.message}>{t('loading.errorMessage')}</Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={retryBootstrap}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{t('loading.retry')}</Text>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator size="large" color={colors.primary} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  // Contenido centrado en toda la pantalla
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Botón principal negro, forma de píldora
  button: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.92,
  },
  buttonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
})

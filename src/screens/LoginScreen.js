// AI-assisted: see docs/AI_LOG.md #18

import React, { useState } from 'react'
import { View, Text, Pressable, TextInput, Alert, StyleSheet, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'
import LoadingOverlay from '../components/LoadingOverlay'
import { validateEmail, validateIdNumber } from '../utils/validators'

export default function LoginScreen() {
  const { t } = useLanguage()
  const { login } = useSession()
  const insets = useSafeAreaInsets()

  // El formulario es local: no pasa por el RegistrationContext
  const [email, setEmail] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [touched, setTouched] = useState({})
  const [sending, setSending] = useState(false)

  const errors = {
    email: validateEmail(email),
    idNumber: validateIdNumber(idNumber),
  }
  const touchField = (field) => setTouched((prev) => ({ ...prev, [field]: true }))
  // Devuelve el texto del error solo si el usuario ya tocó el campo
  const getError = (field) => (touched[field] && errors[field] ? t(errors[field]) : null)

  const emailError = getError('email')
  const idError = getError('idNumber')
  const canSubmit = !errors.email && !errors.idNumber && !sending

  const handleLogin = async () => {
    if (!canSubmit) return

    setSending(true)
    try {
      const result = await login({ email, idNumber })
      if (!result.ok) {
        // No se indica cuál de los dos datos falló
        Alert.alert(t('login.invalidTitle'), t('login.invalidMessage'))
      }
      // Si es ok no se navega a mano: el cambio de sessionState muestra Home
    } catch {
      Alert.alert(t('login.connectionTitle'), t('login.connectionMessage'))
    } finally {
      setSending(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.headerOverline}>{t('general.driver')}</Text>
        <Text style={styles.headerTitle}>UberClone</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>{t('login.title')}</Text>

          <Text style={styles.label}>{t('login.email')}</Text>
          <TextInput
            placeholder={t('login.emailPlaceholder')}
            style={[styles.input, emailError && styles.inputError]}
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            onBlur={() => touchField('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <Text style={styles.label}>{t('login.idNumber')}</Text>
          <TextInput
            style={[styles.input, idError && styles.inputError]}
            placeholderTextColor={colors.textMuted}
            value={idNumber}
            onChangeText={(text) => setIdNumber(text.replace(/\D/g, ''))}
            onBlur={() => touchField('idNumber')}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={10}
          />
          {idError ? <Text style={styles.errorText}>{idError}</Text> : null}
          <Text style={styles.hint}>{t('login.idNumberHint')}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.buttonPressed,
            ]}
            disabled={!canSubmit}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
          >
            <Text style={[styles.buttonText, !canSubmit && styles.buttonTextDisabled]}>
              {t('login.submit')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <LoadingOverlay visible={sending} />
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

  // Tarjeta del formulario
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

  // Cada campo (label + input)
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
    // Solo fontSize (sin lineHeight) para que el texto no se recorte en Android
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: -spacing.md,      // compensa el marginBottom del input
    marginBottom: spacing.md,
  },
  // Frase bajo el documento: explica que es la contraseña
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -spacing.md,      // compensa el marginBottom del input
    marginBottom: spacing.md,
  },

  // Botón principal negro, forma de píldora
  button: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.92,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBackground,
  },
  buttonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  buttonTextDisabled: {
    color: colors.textDisabled,
  },
})

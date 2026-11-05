import React from "react";
import { View, Text, Pressable, TextInput, Image, Alert, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from "../theme/theme";
import useLanguage from "../hooks/useLanguage";
import useRegistration from "../hooks/useRegistration";
import DateField from "../components/forms/DateField";
import SelectField from "../components/forms/SelectField";
import PhotoField from "../components/forms/PhotoField";
import { GENDER_OPTIONS, LANGUAGE_OPTIONS } from "../data/options";

export default function PersonalDataScreen() {
  const { t, setLanguage } = useLanguage();
  const { data, errors, touched, setField, touchField } = useRegistration()

  // Devuelve el texto del error solo si el usuario ya tocó el campo
  const getError = (field) => (touched[field] && errors[field] ? t(errors[field]) : null)

  // Se calculan una vez para usarlos en el borde y en el texto del mismo campo
  const nameError = getError('fullName')
  const idError = getError('idNumber')
  const phoneError = getError('phone')
  const emailError = getError('email')

  const insets = useSafeAreaInsets();

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
                <Text style={styles.title}>{t('registration.tabs.personal')}</Text>

                <PhotoField
                  label={t('registration.personal.profilePicture')}
                  hint={t('registration.personal.profilePictureHint')}
                  value={data.profilePhoto}
                  onChange={(uri) => { setField('profilePhoto', uri); touchField('profilePhoto') }}
                  error={getError('profilePhoto')}
                />

                <Text style={styles.label}>{t('registration.personal.fullName')}</Text>  
                <TextInput
                  placeholder={t('registration.personal.fullNamePlaceholder')}
                  style={[styles.input, nameError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.fullName}
                  onChangeText={(text) => setField('fullName', text)}
                  onBlur={() => touchField('fullName')}
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

                <Text style={styles.label}>{t('registration.personal.idNumber')}</Text>
                <TextInput
                  placeholder={t('registration.personal.idNumberPlaceholder')}
                  style={[styles.input, idError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.idNumber}
                  onChangeText={(text) => setField('idNumber', text.replace(/\D/g, ''))}
                  onBlur={() => touchField('idNumber')}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {idError ? <Text style={styles.errorText}>{idError}</Text> : null}

                <Text style={styles.label}>{t('registration.personal.phone')}</Text>
                <TextInput
                  placeholder={t('registration.personal.phonePlaceholder')}
                  style={[styles.input, phoneError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.phone}
                  onChangeText={(text) => setField('phone', text.replace(/\D/g, ''))}
                  onBlur={() => touchField('phone')}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                <DateField
                  label={t('registration.personal.birthDate')}
                  placeholder={t('registration.personal.birthDatePlaceholder')}
                  value={data.birthDate}
                  maximumDate={new Date()}
                  onChange={(date) => { setField('birthDate', date); touchField('birthDate') }}
                  error={getError('birthDate')}
                />

                <SelectField
                  label={t('registration.personal.gender')}
                  title={t('registration.personal.gender')}
                  placeholder={t('registration.personal.genderPlaceholder')}
                  options={GENDER_OPTIONS}
                  value={data.gender}
                  onChange={(value) => { setField('gender', value); touchField('gender') }}
                  error={getError('gender')}
                />

                <Text style={styles.label}>{t('registration.personal.email')}</Text>
                <TextInput
                  placeholder={t('registration.personal.emailPlaceholder')}
                  style={[styles.input, emailError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.email}
                  onChangeText={(text) => setField('email', text)}
                  onBlur={() => touchField('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <SelectField
                  label={t('registration.personal.language')}
                  title={t('registration.personal.language')}
                  options={LANGUAGE_OPTIONS}
                  value={data.language}
                  onChange={(value) => { setField('language', value); setLanguage(value) }}
                  error={getError('language')}
                />
            </View>
        </ScrollView>
    </View>
  );
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

  // Cada campo (label + input): separa un campo del siguiente
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
    borderColor: colors.error
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
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
  buttonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
})
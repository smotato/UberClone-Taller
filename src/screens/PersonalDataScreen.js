import React from "react";
import { View, Text, Pressable, TextInput, Image, Alert, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from "../theme/theme";
import useLanguage from "../hooks/useLanguage";
import DateField from "../components/forms/DateField";
import SelectField from "../components/forms/SelectField";
import PhotoField from "../components/forms/PhotoField";
import { GENDER_OPTIONS, LANGUAGE_OPTIONS } from "../data/options";

export default function PersonalDataScreen() {
  const { t, language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
            <Text style={styles.headerOverline}>{t('general.driver')}</Text>
            <Text style={styles.headerTitle}>UberClone</Text>
        </View>

        <ScrollView
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.card}>
                <Text style={styles.title}>{t('registration.tabs.personal')}</Text>

                <PhotoField
                  label={t('registration.personal.profilePicture')}
                  hint={t('registration.personal.profilePictureHint')}
                />

                <Text style={styles.label}>{t('registration.personal.fullName')}</Text>  
                <TextInput
                    placeholder={t('registration.personal.fullNamePlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>{t('registration.personal.idNumber')}</Text>
                <TextInput
                    placeholder={t('registration.personal.idNumberPlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>{t('registration.personal.phone')}</Text>
                <TextInput
                    placeholder={t('registration.personal.phonePlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                />

                <DateField
                  label={t('registration.personal.birthDate')}
                  placeholder={t('registration.personal.birthDatePlaceholder')}
                  value={new Date()}
                  maximumDate={new Date()}
                />

                <SelectField
                  label={t('registration.personal.gender')}
                  title={t('registration.personal.gender')}
                  options={GENDER_OPTIONS}
                  value={'male'}
                />

                <Text style={styles.label}>{t('registration.personal.email')}</Text>
                <TextInput
                    placeholder={t('registration.personal.emailPlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                />

                <SelectField
                  label={t('registration.personal.language')}
                  title={t('registration.personal.language')}
                  options={LANGUAGE_OPTIONS}
                  value={'es'}
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
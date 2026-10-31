import React from "react";
import { View, Text, Pressable, TextInput, Image, Alert, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from "../theme/theme";
import useLanguage from "../hooks/useLanguage";
import DateField from "../components/forms/DateField";
import PhotoField from "../components/forms/PhotoField";
import CheckboxField from "../components/forms/CheckboxField"

export default function DocumentsScreen() {
  const { t } = useLanguage();
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
                <Text style={styles.title}>{t('registration.tabs.documents')}</Text>

                <Text style={styles.label}>{t('registration.documents.licenseNumber')}</Text>
                <TextInput
                    placeholder={t('registration.documents.licenseNumberPlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                />

                <PhotoField
                  label={t('registration.documents.licensePhoto')}
                  hint={t('registration.documents.licensePhotoHint')}
                />

                <DateField
                  label={t('registration.documents.licenseExpiry')}
                  placeholder={t('registration.documents.licenseExpiryPlaceholder')}
                  value={new Date()}
                  maximumDate={new Date()}
                />

                <PhotoField
                  label={t('registration.documents.soatPhoto')}
                  hint={t('registration.documents.soatPhotoHint')}
                />

                <DateField
                  label={t('registration.documents.soatExpiry')}
                  placeholder={t('registration.documents.soatExpiryPlaceholder')}
                  value={new Date()}
                  maximumDate={new Date()}
                />

                <PhotoField
                  label={t('registration.documents.inspectionPhoto')}
                  hint={t('registration.documents.inspectionPhotoHint')}
                />

                <DateField
                  label={t('registration.documents.inspectionExpiry')}
                  placeholder={t('registration.documents.inspectionExpiryPlaceholder')}
                  value={new Date()}
                  maximumDate={new Date()}
                />

                <Text style={styles.label}>{t('registration.documents.mercadoPagoEmail')}</Text>
                <TextInput
                    placeholder={t('registration.documents.mercadoPagoEmailPlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                />

                <CheckboxField
                    label={t('registration.documents.terms')}
                    value={true}
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
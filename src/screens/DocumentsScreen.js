import React from "react";
import { View, Text, Pressable, TextInput, Image, Alert, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from "../theme/theme";
import useLanguage from "../hooks/useLanguage";
import useRegistration from "../hooks/useRegistration";
import DateField from "../components/forms/DateField";
import PhotoField from "../components/forms/PhotoField";
import CheckboxField from "../components/forms/CheckboxField"
import { isInspectionRequired, isYearEntered } from "../utils/validators";

export default function DocumentsScreen() {
  const { t } = useLanguage();
  const { data, errors, touched, setField, touchField } = useRegistration()
  const insets = useSafeAreaInsets();

  const getError = (field) => (touched[field] && errors[field] ? t(errors[field]) : null)

  const licenseNumberError = getError('licenseNumber')
  const mpEmailError = getError('mercadoPagoEmail')

  // La revisión técnico-mecánica solo aplica según el año del vehículo (pestaña 2)
  const inspectionRequired = isInspectionRequired(data.year)
    // Mensaje de la sección de revisión técnico-mecánica según el estado del año del vehículo
  const inspectionNote = !isYearEntered(data.year)
    ? t('registration.documents.inspectionNeedsYear')
    : !inspectionRequired
      ? t('registration.documents.inspectionNotRequired')
      : null

  // Las fechas de vencimiento deben ser posteriores a hoy: mínimo mañana
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

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
                <Text style={styles.title}>{t('registration.tabs.documents')}</Text>

                <Text style={styles.label}>{t('registration.documents.licenseNumber')}</Text>
                <TextInput
                  placeholder={t('registration.documents.licenseNumberPlaceholder')}
                  style={[styles.input, licenseNumberError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.licenseNumber}
                  onChangeText={(text) => setField('licenseNumber', text.replace(/\D/g, ''))}
                  onBlur={() => touchField('licenseNumber')}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {licenseNumberError ? <Text style={styles.errorText}>{licenseNumberError}</Text> : null}

                <PhotoField
                  label={t('registration.documents.licensePhoto')}
                  hint={t('registration.documents.licensePhotoHint')}
                  value={data.licensePhoto}
                  onChange={(uri) => { setField('licensePhoto', uri); touchField('licensePhoto') }}
                  error={getError('licensePhoto')}
                />

                <DateField
                  label={t('registration.documents.licenseExpiry')}
                  placeholder={t('registration.documents.licenseExpiryPlaceholder')}
                  value={data.licenseExpiry}
                  minimumDate={tomorrow}
                  onChange={(date) => { setField('licenseExpiry', date); touchField('licenseExpiry') }}
                  error={getError('licenseExpiry')}
                />

                <PhotoField
                  label={t('registration.documents.soatPhoto')}
                  hint={t('registration.documents.soatPhotoHint')}
                  value={data.soatPhoto}
                  onChange={(uri) => { setField('soatPhoto', uri); touchField('soatPhoto') }}
                  error={getError('soatPhoto')}
                />

                <DateField
                  label={t('registration.documents.soatExpiry')}
                  placeholder={t('registration.documents.soatExpiryPlaceholder')}
                  value={data.soatExpiry}
                  minimumDate={tomorrow}
                  onChange={(date) => { setField('soatExpiry', date); touchField('soatExpiry') }}
                  error={getError('soatExpiry')}
                />

                {/* Sección siempre visible; se bloquea mientras no aplique */}
                {inspectionNote ? <Text style={styles.inspectionNote}>{inspectionNote}</Text> : null}
                <View style={!inspectionRequired && styles.inspectionLocked}>
                  <PhotoField
                    label={t('registration.documents.inspectionPhoto')}
                    hint={t('registration.documents.inspectionPhotoHint')}
                    value={data.inspectionPhoto}
                    onChange={(uri) => { setField('inspectionPhoto', uri); touchField('inspectionPhoto') }}
                    error={getError('inspectionPhoto')}
                  />

                  <DateField
                    label={t('registration.documents.inspectionExpiry')}
                    placeholder={t('registration.documents.inspectionExpiryPlaceholder')}
                    value={data.inspectionExpiry}
                    minimumDate={tomorrow}
                    onChange={(date) => { setField('inspectionExpiry', date); touchField('inspectionExpiry') }}
                    error={getError('inspectionExpiry')}
                  />
                </View>

                <Text style={styles.label}>{t('registration.documents.mercadoPagoEmail')}</Text>
                <TextInput
                  placeholder={t('registration.documents.mercadoPagoEmailPlaceholder')}
                  style={[styles.input, mpEmailError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.mercadoPagoEmail}
                  onChangeText={(text) => setField('mercadoPagoEmail', text)}
                  onBlur={() => touchField('mercadoPagoEmail')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {mpEmailError ? <Text style={styles.errorText}>{mpEmailError}</Text> : null}

                <CheckboxField
                  label={t('registration.documents.terms')}
                  value={data.terms}
                  onChange={(value) => { setField('terms', value); touchField('terms') }}
                  error={getError('terms')}
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
  // Mensaje sobre la revisión técnico-mecánica
  inspectionNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  // Sección bloqueada: atenuada y sin respuesta a toques
  inspectionLocked: {
    opacity: 0.45,
    pointerEvents: 'none',
  },
})
import React from 'react';
import { View, Text, Pressable, TextInput, Image, Alert, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from "../theme/theme";
import useLanguage from "../hooks/useLanguage";
import useRegistration from "../hooks/useRegistration";
import SelectField from "../components/forms/SelectField";
import PhotoField from "../components/forms/PhotoField";
import { CATEGORY_OPTIONS, COLOR_OPTIONS } from "../data/options";
import { normalizePlate } from "../utils/validators";

export default function VehicleScreen() {
  const { t } = useLanguage();
  const { data, errors, touched, setField, touchField } = useRegistration()
  const insets = useSafeAreaInsets();

  // Devuelve el texto del error solo si el usuario ya tocó el campo
  const getError = (field) => (touched[field] && errors[field] ? t(errors[field]) : null)

  const plateError = getError('plate')
  const brandError = getError('brand')
  const modelError = getError('model')
  const yearError = getError('year')
  const capacityError = getError('capacity')

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
                <Text style={styles.title}>{t('registration.tabs.vehicle')}</Text>

                <SelectField
                  label={t('registration.vehicle.category')}
                  title={t('registration.vehicle.category')}
                  placeholder={t('registration.vehicle.categoryPlaceholder')}
                  options={CATEGORY_OPTIONS}
                  value={data.category}
                  onChange={(value) => {
                    setField('category', value)
                    touchField('category')
                    touchField('capacity')   // la capacidad mínima depende de la categoría
                  }}
                  error={getError('category')}
                />

                <Text style={styles.label}>{t('registration.vehicle.plate')}</Text>
                <TextInput
                  placeholder={t('registration.vehicle.platePlaceholder')}
                  style={[styles.input, plateError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.plate}
                  onChangeText={(text) => setField('plate', normalizePlate(text))}
                  onBlur={() => touchField('plate')}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                />
                {plateError ? <Text style={styles.errorText}>{plateError}</Text> : null}

                <Text style={styles.label}>{t('registration.vehicle.brand')}</Text>
                <TextInput
                  placeholder={t('registration.vehicle.brandPlaceholder')}
                  style={[styles.input, brandError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.brand}
                  onChangeText={(text) => setField('brand', text)}
                  onBlur={() => touchField('brand')}
                />
                {brandError ? <Text style={styles.errorText}>{brandError}</Text> : null}

                <Text style={styles.label}>{t('registration.vehicle.model')}</Text>
                <TextInput
                  placeholder={t('registration.vehicle.modelPlaceholder')}
                  style={[styles.input, modelError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.model}
                  onChangeText={(text) => setField('model', text)}
                  onBlur={() => touchField('model')}
                />
                {modelError ? <Text style={styles.errorText}>{modelError}</Text> : null}

                <Text style={styles.label}>{t('registration.vehicle.year')}</Text>
                <TextInput
                  placeholder={t('registration.vehicle.yearPlaceholder')}
                  style={[styles.input, yearError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.year}
                  onChangeText={(text) => setField('year', text.replace(/\D/g, ''))}
                  onBlur={() => touchField('year')}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                {yearError ? <Text style={styles.errorText}>{yearError}</Text> : null}

                <SelectField
                  label={t('registration.vehicle.color')}
                  title={t('registration.vehicle.color')}
                  placeholder={t('registration.vehicle.colorPlaceholder')}
                  options={COLOR_OPTIONS}
                  value={data.color}
                  onChange={(value) => { setField('color', value); touchField('color') }}
                  error={getError('color')}
                />

                <Text style={styles.label}>{t('registration.vehicle.capacity')}</Text>
                <TextInput
                  placeholder={t('registration.vehicle.capacityPlaceholder')}
                  style={[styles.input, capacityError && styles.inputError]}
                  placeholderTextColor={colors.textMuted}
                  value={data.capacity}
                  onChangeText={(text) => setField('capacity', text.replace(/\D/g, ''))}
                  onBlur={() => touchField('capacity')}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                {capacityError ? <Text style={styles.errorText}>{capacityError}</Text> : null}

                <PhotoField
                  label={t('registration.vehicle.photo')}
                  hint={t('registration.vehicle.photoHint')}
                  value={data.vehiclePhoto}
                  onChange={(uri) => { setField('vehiclePhoto', uri); touchField('vehiclePhoto') }}
                  error={getError('vehiclePhoto')}
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
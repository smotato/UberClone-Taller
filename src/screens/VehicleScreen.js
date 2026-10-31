import React from 'react';
import { View, Text, Pressable, TextInput, Image, Alert, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from "../theme/theme";
import useLanguage from "../hooks/useLanguage";
import SelectField from "../components/forms/SelectField";
import PhotoField from "../components/forms/PhotoField";
import { CATEGORY_OPTIONS, COLOR_OPTIONS } from "../data/options";

export default function VehicleScreen() {
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
                <Text style={styles.title}>{t('registration.tabs.vehicle')}</Text>

                <SelectField
                  label={t('registration.vehicle.category')}
                  title={t('registration.vehicle.category')}
                  options={CATEGORY_OPTIONS}
                  value={'hourly'}
                />

                <Text style={styles.label}>{t('registration.vehicle.plate')}</Text>
                <TextInput
                    placeholder={t('registration.vehicle.platePlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>{t('registration.vehicle.brand')}</Text>
                <TextInput
                    placeholder={t('registration.vehicle.brandPlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>{t('registration.vehicle.model')}</Text>
                <TextInput
                    placeholder={t('registration.vehicle.modelPlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>{t('registration.vehicle.year')}</Text>
                <TextInput
                    placeholder={t('registration.vehicle.yearPlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                />
                
                <SelectField
                  label={t('registration.vehicle.color')}
                  title={t('registration.vehicle.color')}
                  options={COLOR_OPTIONS}
                  value={'white'}
                />

                <Text style={styles.label}>{t('registration.vehicle.capacity')}</Text>
                <TextInput
                    placeholder={t('registration.vehicle.capacityPlaceholder')}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                />

                <PhotoField
                  label={t('registration.vehicle.photo')}
                  hint={t('registration.vehicle.photoHint')}
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
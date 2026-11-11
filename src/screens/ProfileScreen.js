// AI-assisted: see docs/AI_LOG.md #19
import React from 'react'
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'

// Tamaño de las miniaturas de fotos (no existe en el tema)
const THUMB_SIZE = 72

// Nombre del idioma guardado en el documento
const LANGUAGE_NAMES = { es: 'Español', en: 'English' }

// Convierte un Timestamp de Firestore en texto; devuelve null si no hay valor
const formatDate = (value, locale) => {
  if (!value) return null
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(locale)
}

// Fila de etiqueta y valor; no se muestra si no hay valor
function InfoRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(value)}</Text>
    </View>
  )
}

// Foto en miniatura con su etiqueta; no se muestra si no hay URL
function PhotoThumb({ label, uri }) {
  if (!uri) return null
  return (
    <View style={styles.thumbItem}>
      <Image source={{ uri }} style={styles.thumb} />
      <Text style={styles.thumbLabel} numberOfLines={2}>{label}</Text>
    </View>
  )
}

// Perfil en solo lectura; la edición llegará después
export default function ProfileScreen() {
  const { t, language } = useLanguage()
  const { driver, logout } = useSession()

  const vehicle = driver?.vehicle ?? {}
  const documents = driver?.documents ?? {}
  const locale = language === 'en' ? 'en-US' : 'es-CO'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Datos personales */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('profile.personal')}</Text>
        <View style={styles.thumbRow}>
          <PhotoThumb label={t('registration.personal.profilePicture')} uri={driver?.profilePhotoURL} />
        </View>
        <InfoRow label={t('registration.personal.fullName')} value={driver?.fullName} />
        <InfoRow label={t('registration.personal.idNumber')} value={driver?.idNumber} />
        <InfoRow label={t('registration.personal.phone')} value={driver?.phone} />
        <InfoRow label={t('registration.personal.birthDate')} value={formatDate(driver?.birthDate, locale)} />
        <InfoRow
          label={t('registration.personal.gender')}
          value={driver?.gender ? t(`options.gender.${driver.gender}`) : null}
        />
        <InfoRow label={t('registration.personal.email')} value={driver?.email} />
        <InfoRow label={t('registration.personal.language')} value={LANGUAGE_NAMES[driver?.language]} />
      </View>

      {/* Vehículo */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('profile.vehicle')}</Text>
        <View style={styles.thumbRow}>
          <PhotoThumb label={t('registration.vehicle.photo')} uri={vehicle.vehiclePhotoURL} />
        </View>
        <InfoRow
          label={t('registration.vehicle.category')}
          value={vehicle.category ? t(`options.category.${vehicle.category}`) : null}
        />
        <InfoRow label={t('registration.vehicle.plate')} value={vehicle.plate} />
        <InfoRow label={t('registration.vehicle.brand')} value={vehicle.brand} />
        <InfoRow label={t('registration.vehicle.model')} value={vehicle.model} />
        <InfoRow label={t('registration.vehicle.year')} value={vehicle.year} />
        <InfoRow
          label={t('registration.vehicle.color')}
          value={vehicle.color ? t(`options.color.${vehicle.color}`) : null}
        />
        <InfoRow label={t('registration.vehicle.capacity')} value={vehicle.capacity} />
      </View>

      {/* Documentos; la revisión técnico-mecánica puede ser null */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('profile.documents')}</Text>
        <View style={styles.thumbRow}>
          <PhotoThumb label={t('registration.documents.licensePhoto')} uri={documents.licensePhotoURL} />
          <PhotoThumb label={t('registration.documents.soatPhoto')} uri={documents.soatPhotoURL} />
          <PhotoThumb label={t('registration.documents.inspectionPhoto')} uri={documents.inspectionPhotoURL} />
        </View>
        <InfoRow label={t('registration.documents.licenseNumber')} value={documents.licenseNumber} />
        <InfoRow
          label={t('registration.documents.licenseExpiry')}
          value={formatDate(documents.licenseExpiry, locale)}
        />
        <InfoRow
          label={t('registration.documents.soatExpiry')}
          value={formatDate(documents.soatExpiry, locale)}
        />
        <InfoRow
          label={t('registration.documents.inspectionExpiry')}
          value={formatDate(documents.inspectionExpiry, locale)}
        />
        <InfoRow label={t('registration.documents.mercadoPagoEmail')} value={documents.mercadoPagoEmail} />
      </View>

      <Text style={styles.editSoon}>{t('profile.editSoon')}</Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={logout}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{t('drawer.logout')}</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  // Contenedor general de la pantalla
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },

  // Tarjeta de cada sección
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Filas de etiqueta y valor
  row: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowValue: {
    ...typography.body,
    color: colors.text,
  },

  // Miniaturas de fotos
  thumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  thumbItem: {
    width: THUMB_SIZE,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  thumbLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Aviso de que la edición llegará después
  editSoon: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Botón de cerrar sesión: píldora negra con texto blanco, igual que iniciar sesión y enviar registro
  button: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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

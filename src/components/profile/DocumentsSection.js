// AI-assisted: see docs/AI_LOG.md #22
import React, { useCallback } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography, sizes } from '../../theme/theme'
import useLanguage from '../../hooks/useLanguage'
import useProfileEdit from '../../hooks/useProfileEdit'
import { updateDriverProfile } from '../../services/driverServices'
import { uploadRenewedPhoto } from '../../services/storageServices'
import {
  documentsToDraft,
  documentsToUpdate,
  mergeUploadedUrls,
  isNewPhoto,
  isExpiryChanged,
  toDateOrNull,
} from '../../utils/profileMappers'
import {
  validateDocumentPhoto,
  validateExpiryDate,
  validateMercadoPagoEmail,
  isInspectionRequired,
} from '../../utils/validators'
import PhotoField from '../forms/PhotoField'
import DateField from '../forms/DateField'
import ProfileSection from './ProfileSection'
import { InfoRow, PhotoThumb, LockedNote, formatDate, thumbRowStyle } from './ProfileInfo'

// Documentos que se renuevan: foto y vencimiento siempre van juntos
const PAIRS = [
  { key: 'license', photo: 'licensePhoto', expiry: 'licenseExpiry' },
  { key: 'soat', photo: 'soatPhoto', expiry: 'soatExpiry' },
  { key: 'inspection', photo: 'inspectionPhoto', expiry: 'inspectionExpiry' },
]

// Error de la foto: si cambió el vencimiento, la foto también debe ser nueva
const photoError = (draft, source, { photo, expiry }) => {
  if (isNewPhoto(draft[photo])) return validateDocumentPhoto(draft[photo])
  return isExpiryChanged(source, draft, expiry) ? 'errors.photoRequired' : null
}

// Error del vencimiento: si hay foto nueva, el vencimiento debe ser nuevo y posterior a hoy
const expiryError = (draft, source, { photo, expiry }) => {
  if (isExpiryChanged(source, draft, expiry)) return validateExpiryDate(draft[expiry])
  return isNewPhoto(draft[photo]) ? 'errors.dateRequired' : null
}

// La revisión técnico-mecánica solo se valida si aplica según el año guardado del vehículo
const inspectionApplies = (source) => isInspectionRequired(source?.vehicle?.year)

// Validadores por campo; se reutilizan los del registro sin cambios
const VALIDATORS = {
  licensePhoto: (draft, source) => photoError(draft, source, PAIRS[0]),
  licenseExpiry: (draft, source) => expiryError(draft, source, PAIRS[0]),
  soatPhoto: (draft, source) => photoError(draft, source, PAIRS[1]),
  soatExpiry: (draft, source) => expiryError(draft, source, PAIRS[1]),
  inspectionPhoto: (draft, source) => (inspectionApplies(source) ? photoError(draft, source, PAIRS[2]) : null),
  inspectionExpiry: (draft, source) => (inspectionApplies(source) ? expiryError(draft, source, PAIRS[2]) : null),
  mercadoPagoEmail: (draft) => validateMercadoPagoEmail(draft.mercadoPagoEmail),
}

// Una fecha de vencimiento ya pasó si su día es anterior a hoy
const isExpired = (value) => {
  const date = toDateOrNull(value)
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// Documentos: renovación de licencia, SOAT y revisión técnico-mecánica, y correo de Mercado Pago
export default function DocumentsSection({ driver, driverId, editDisabled, onEditingChange }) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en-US' : 'es-CO'
  const documents = driver?.documents ?? {}
  const inspectionRequired = inspectionApplies(driver)

  // Sube las fotos nuevas en paralelo; solo si todas tienen éxito se escribe el documento, en una sola actualización
  const handleSave = useCallback(async ({ update }) => {
    const urls = await Promise.all(
      update.newPhotos.map(async ({ key, field, uri }) => [field, await uploadRenewedPhoto(driverId, `${key}Photo`, uri)])
    )
    await updateDriverProfile(driverId, mergeUploadedUrls(update.fields, Object.fromEntries(urls)))
  }, [driverId])

  const edit = useProfileEdit({
    source: driver,
    toDraft: documentsToDraft,
    getUpdate: documentsToUpdate,
    validators: VALIDATORS,
    onSave: handleSave,
    onEditingChange,
  })

  // Las fechas de vencimiento deben ser posteriores a hoy: mínimo mañana
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Cambiar la foto o el vencimiento marca ambos campos del documento como tocados
  const changePair = (pair, field, value) => {
    edit.setField(field, value)
    edit.touchField(pair.photo)
    edit.touchField(pair.expiry)
  }

  const mpEmailError = edit.getError('mercadoPagoEmail')
  const inspectionMissing = inspectionRequired && !documents.inspectionPhotoURL && !documents.inspectionExpiry
  // Con datos guardados se muestra aunque ya no aplique; sin datos, solo si es obligatoria
  const showInspection = inspectionRequired || Boolean(documents.inspectionPhotoURL || documents.inspectionExpiry)

  // Foto y vencimiento de un documento en modo edición
  const renderPair = (pair, labels) => (
    <>
      <PhotoField
        label={t(labels.photo)}
        hint={t(labels.hint)}
        value={edit.draft[pair.photo]}
        onChange={(uri) => changePair(pair, pair.photo, uri)}
        error={edit.getError(pair.photo)}
      />
      <DateField
        label={t(labels.expiry)}
        placeholder={t(labels.placeholder)}
        value={edit.draft[pair.expiry]}
        minimumDate={tomorrow}
        onChange={(date) => changePair(pair, pair.expiry, date)}
        error={edit.getError(pair.expiry)}
      />
    </>
  )

  return (
    <ProfileSection
      title={t('profile.documents')}
      isEditing={edit.isEditing}
      onEdit={edit.startEdit}
      onSave={edit.save}
      onCancel={edit.cancel}
      editDisabled={editDisabled}
      canSave={edit.dirty && edit.isValid}
      saving={edit.saving}
      message={edit.message}
    >
      {/* Aviso: la revisión es obligatoria por el año del vehículo y todavía no se ha cargado */}
      {inspectionMissing ? <Text style={styles.warning}>{t('profile.inspectionMissing')}</Text> : null}

      {/* El número de licencia siempre está bloqueado */}
      <InfoRow label={t('registration.documents.licenseNumber')} value={documents.licenseNumber} locked />
      <LockedNote text={t('profile.lockedField')} />

      {edit.isEditing ? (
        <View style={styles.form}>
          {renderPair(PAIRS[0], {
            photo: 'registration.documents.licensePhoto',
            hint: 'registration.documents.licensePhotoHint',
            expiry: 'registration.documents.licenseExpiry',
            placeholder: 'registration.documents.licenseExpiryPlaceholder',
          })}
          {renderPair(PAIRS[1], {
            photo: 'registration.documents.soatPhoto',
            hint: 'registration.documents.soatPhotoHint',
            expiry: 'registration.documents.soatExpiry',
            placeholder: 'registration.documents.soatExpiryPlaceholder',
          })}
          {inspectionRequired
            ? renderPair(PAIRS[2], {
                photo: 'registration.documents.inspectionPhoto',
                hint: 'registration.documents.inspectionPhotoHint',
                expiry: 'registration.documents.inspectionExpiry',
                placeholder: 'registration.documents.inspectionExpiryPlaceholder',
              })
            : null}

          <Text style={styles.label}>{t('registration.documents.mercadoPagoEmail')}</Text>
          <TextInput
            placeholder={t('registration.documents.mercadoPagoEmailPlaceholder')}
            style={[styles.input, mpEmailError && styles.inputError]}
            placeholderTextColor={colors.textMuted}
            value={edit.draft.mercadoPagoEmail}
            onChangeText={(text) => edit.setField('mercadoPagoEmail', text)}
            onBlur={() => edit.touchField('mercadoPagoEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {mpEmailError ? <Text style={styles.errorText}>{mpEmailError}</Text> : null}
        </View>
      ) : (
        <>
          <View style={[thumbRowStyle, styles.thumbs]}>
            <PhotoThumb label={t('registration.documents.licensePhoto')} uri={documents.licensePhotoURL} />
            <PhotoThumb label={t('registration.documents.soatPhoto')} uri={documents.soatPhotoURL} />
            {showInspection ? (
              <PhotoThumb label={t('registration.documents.inspectionPhoto')} uri={documents.inspectionPhotoURL} />
            ) : null}
          </View>
          <InfoRow
            label={t('registration.documents.licenseExpiry')}
            value={formatDate(documents.licenseExpiry, locale)}
            badge={isExpired(documents.licenseExpiry) ? t('profile.expired') : null}
          />
          <InfoRow
            label={t('registration.documents.soatExpiry')}
            value={formatDate(documents.soatExpiry, locale)}
            badge={isExpired(documents.soatExpiry) ? t('profile.expired') : null}
          />
          {showInspection ? (
            <InfoRow
              label={t('registration.documents.inspectionExpiry')}
              value={formatDate(documents.inspectionExpiry, locale)}
              badge={isExpired(documents.inspectionExpiry) ? t('profile.expired') : null}
            />
          ) : null}
          <InfoRow label={t('registration.documents.mercadoPagoEmail')} value={documents.mercadoPagoEmail} />
        </>
      )}
    </ProfileSection>
  )
}

const styles = StyleSheet.create({
  form: {
    marginTop: spacing.lg,
  },
  thumbs: {
    marginTop: spacing.md,
  },
  warning: {
    ...typography.label,
    color: colors.textSecondary,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
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
})

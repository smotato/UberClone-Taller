// AI-assisted: see docs/AI_LOG.md #22
import React, { useCallback, useMemo } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography, sizes } from '../../theme/theme'
import useLanguage from '../../hooks/useLanguage'
import useProfileEdit from '../../hooks/useProfileEdit'
import { updateDriverProfile } from '../../services/dbServices'
import { personalToDraft, personalToUpdate } from '../../utils/profileMappers'
import { validatePhone, validateEmail } from '../../utils/validators'
import ProfileSection from './ProfileSection'
import { InfoRow, PhotoThumb, LockedNote, formatDate, thumbRowStyle } from './ProfileInfo'

// Nombre del idioma guardado en el documento
const LANGUAGE_NAMES = { es: 'Español', en: 'English' }

// Validadores por campo; se reutilizan los del registro sin cambios
const VALIDATORS = {
  phone: (draft) => validatePhone(draft.phone),
  email: (draft) => validateEmail(draft.email),
}

// Datos personales: solo celular y correo son editables; el resto se muestra bloqueado
export default function PersonalSection({ driver, driverId, editDisabled, onEditingChange }) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en-US' : 'es-CO'

  // Guarda solo lo que cambió; devuelve la clave del aviso de éxito
  const handleSave = useCallback(async ({ update }) => {
    await updateDriverProfile(driverId, update.fields)
    return 'email' in update.fields ? 'profile.savedEmailChanged' : 'profile.saved'
  }, [driverId])

  const edit = useProfileEdit({
    source: driver,
    toDraft: personalToDraft,
    getUpdate: personalToUpdate,
    validators: VALIDATORS,
    onSave: handleSave,
    onEditingChange,
  })

  const phoneError = edit.getError('phone')
  const emailError = edit.getError('email')

  // Datos bloqueados: se muestran igual en lectura y en edición
  const lockedRows = useMemo(() => (
    <>
      <View style={thumbRowStyle}>
        <PhotoThumb label={t('registration.personal.profilePicture')} uri={driver?.profilePhotoURL} locked />
      </View>
      <InfoRow label={t('registration.personal.fullName')} value={driver?.fullName} locked />
      <InfoRow label={t('registration.personal.idNumber')} value={driver?.idNumber} locked />
      <InfoRow label={t('registration.personal.birthDate')} value={formatDate(driver?.birthDate, locale)} locked />
      <InfoRow
        label={t('registration.personal.gender')}
        value={driver?.gender ? t(`options.gender.${driver.gender}`) : null}
        locked
      />
    </>
  ), [driver, locale, t])

  return (
    <ProfileSection
      title={t('profile.personal')}
      isEditing={edit.isEditing}
      onEdit={edit.startEdit}
      onSave={edit.save}
      onCancel={edit.cancel}
      editDisabled={editDisabled}
      canSave={edit.dirty && edit.isValid}
      saving={edit.saving}
      message={edit.message}
    >
      {lockedRows}
      <LockedNote text={t('profile.lockedField')} />

      {edit.isEditing ? (
        <View style={styles.form}>
          <Text style={styles.label}>{t('registration.personal.phone')}</Text>
          <TextInput
            placeholder={t('registration.personal.phonePlaceholder')}
            style={[styles.input, phoneError && styles.inputError]}
            placeholderTextColor={colors.textMuted}
            value={edit.draft.phone}
            onChangeText={(text) => edit.setField('phone', text.replace(/\D/g, ''))}
            onBlur={() => edit.touchField('phone')}
            keyboardType="number-pad"
            maxLength={10}
          />
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

          <Text style={styles.label}>{t('registration.personal.email')}</Text>
          <TextInput
            placeholder={t('registration.personal.emailPlaceholder')}
            style={[styles.input, emailError && styles.inputError]}
            placeholderTextColor={colors.textMuted}
            value={edit.draft.email}
            onChangeText={(text) => edit.setField('email', text)}
            onBlur={() => edit.touchField('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>
      ) : (
        <>
          <InfoRow label={t('registration.personal.phone')} value={driver?.phone} />
          <InfoRow label={t('registration.personal.email')} value={driver?.email} />
          <InfoRow label={t('registration.personal.language')} value={LANGUAGE_NAMES[driver?.language]} />
        </>
      )}
    </ProfileSection>
  )
}

const styles = StyleSheet.create({
  form: {
    marginTop: spacing.lg,
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

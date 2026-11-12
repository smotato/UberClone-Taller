// AI-assisted: see docs/AI_LOG.md #22
import React, { useCallback, useEffect, useState } from 'react'
import useLanguage from '../../hooks/useLanguage'
import { updateDriverProfile } from '../../services/dbServices'
import { LANGUAGE_OPTIONS } from '../../data/options'
import SelectField from '../forms/SelectField'
import ProfileSection from './ProfileSection'

// Tiempo que se muestra el aviso de error antes de desaparecer
const MESSAGE_MS = 5000

// Configuración: el idioma se aplica al instante, sin botón Guardar
export default function LanguageSection({ driver, driverId }) {
  const { t, language, setLanguage } = useLanguage()
  const [message, setMessage] = useState(null)

  // El aviso desaparece solo
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [message])

  const handleChange = useCallback(async (value) => {
    if (value === language) return
    // Se aplica y se guarda en el celular al instante
    setLanguage(value)
    setMessage(null)
    if (!driverId || value === driver?.language) return
    try {
      // Solo se escribe el campo language en el documento del conductor
      await updateDriverProfile(driverId, { language: value })
    } catch {
      // El idioma se mantiene en la app; solo se avisa que no se guardó en la cuenta.
      // Se lee el texto del idioma nuevo, no el del render anterior
      setMessage({ type: 'error', textKey: 'profile.languageSaveError' })
    }
  }, [language, setLanguage, driverId, driver?.language])

  return (
    <ProfileSection
      title={t('profile.settings')}
      message={message ? { type: message.type, text: t(message.textKey) } : null}
    >
      <SelectField
        label={t('profile.language')}
        title={t('profile.language')}
        options={LANGUAGE_OPTIONS}
        value={language}
        onChange={handleChange}
      />
    </ProfileSection>
  )
}

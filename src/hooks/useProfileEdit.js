// AI-assisted: see docs/AI_LOG.md #22
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import useLanguage from './useLanguage'

// Tiempo que se muestra el aviso de éxito antes de desaparecer
const SUCCESS_MESSAGE_MS = 4000
// Espera para que el overlay termine de ocultarse antes de mostrar el Alert (en iOS una alerta no aparece sobre un Modal abierto)
const ALERT_DELAY_MS = 400

// Hook genérico para editar una sección del perfil.
// - source: documento actual del conductor (en vivo)
// - toDraft(source): crea el borrador desde el documento (debe ser una función estable, definida fuera del componente)
// - getUpdate(source, draft): devuelve { fields, newPhotos } con lo que cambió
// - validators: { campo: (draft, source) => claveDeError | null }
// - onSave({ draft, update }): guarda y devuelve opcionalmente la clave del aviso de éxito; lanza un error si falla
// - onEditingChange(bool): avisa a la pantalla cuando la sección entra o sale de edición
export default function useProfileEdit({ source, toDraft, getUpdate, validators, onSave, onEditingChange }) {
  const { t } = useLanguage()

  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState(null)
  const [touched, setTouched] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // Fuera de edición el borrador sigue al documento en vivo; en edición no se pisa lo que escribe el usuario
  const baseDraft = useMemo(() => toDraft(source), [source, toDraft])
  const draft = isEditing && editDraft ? editDraft : baseDraft

  // Errores de todos los campos (clave de traducción o null)
  const errors = useMemo(() => {
    const result = {}
    Object.keys(validators).forEach((field) => {
      result[field] = validators[field](draft, source)
    })
    return result
  }, [validators, draft, source])

  const isValid = useMemo(() => Object.values(errors).every((error) => !error), [errors])

  const update = useMemo(() => getUpdate(source, draft), [getUpdate, source, draft])
  const dirty = Object.keys(update.fields).length > 0 || update.newPhotos.length > 0

  // El aviso de éxito desaparece solo
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), SUCCESS_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [message])

  const setField = useCallback((field, value) => {
    setEditDraft((current) => ({ ...(current ?? baseDraft), [field]: value }))
  }, [baseDraft])

  const touchField = useCallback((field) => {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }))
  }, [])

  // El error solo se muestra si el campo fue tocado
  const getError = useCallback(
    (field) => (touched[field] && errors[field] ? t(errors[field]) : null),
    [touched, errors, t]
  )

  const startEdit = useCallback(() => {
    setEditDraft(baseDraft)
    setTouched({})
    setMessage(null)
    setIsEditing(true)
    onEditingChange?.(true)
  }, [baseDraft, onEditingChange])

  // Cancelar descarta los cambios
  const cancel = useCallback(() => {
    setIsEditing(false)
    setEditDraft(null)
    setTouched({})
    onEditingChange?.(false)
  }, [onEditingChange])

  const save = useCallback(async () => {
    if (saving) return
    // Marca todos los campos como tocados para que se vean los errores pendientes
    setTouched(Object.keys(validators).reduce((all, field) => ({ ...all, [field]: true }), {}))
    if (!isValid || !dirty) return

    setSaving(true)
    try {
      const successKey = await onSave({ draft, update })
      setSaving(false)
      setIsEditing(false)
      setEditDraft(null)
      setTouched({})
      setMessage({ type: 'success', text: t(successKey ?? 'profile.saved') })
      onEditingChange?.(false)
    } catch {
      // Se oculta el overlay primero y la sección queda en edición con lo escrito
      setSaving(false)
      setTimeout(() => Alert.alert(t('profile.saveError')), ALERT_DELAY_MS)
    }
  }, [saving, validators, isValid, dirty, onSave, draft, update, t, onEditingChange])

  return {
    draft, setField, touchField, getError,
    isEditing, startEdit, cancel, save,
    saving, dirty, isValid, message,
  }
}

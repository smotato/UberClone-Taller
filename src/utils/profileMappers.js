// AI-assisted: see docs/AI_LOG.md #22
// Funciones puras (sin React ni Firebase) que convierten entre el documento del conductor y los borradores del perfil

// ---------- Helpers ----------

// Convierte lo que llegue de Firestore en Date; misma tolerancia que formatDate de ProfileScreen
// (valor con toDate(), número o texto). Devuelve null si no hay valor o no es válido
export const toDateOrNull = (value) => {
  if (!value) return null
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// Una foto nueva es una ruta local del selector de imágenes; la que ya está guardada es una URL https
export const isRemoteUrl = (uri) => typeof uri === 'string' && /^https?:\/\//i.test(uri)
export const isNewPhoto = (uri) => Boolean(uri) && !isRemoteUrl(uri)

// Compara dos fechas por día calendario, ignorando la hora
const isSameDay = (a, b) => {
  if (!a || !b) return a === b
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Misma normalización que el registro: recortado y en minúsculas
const normalizeEmail = (value) => (value ?? '').trim().toLowerCase()

// ---------- Datos personales (celular y correo) ----------

// Documento -> borrador de la sección de datos personales
export function personalToDraft(driver) {
  return {
    phone: driver?.phone ?? '',
    email: driver?.email ?? '',
  }
}

// Borrador -> campos a actualizar (solo lo que cambió); no hay fotos que subir en esta sección
export function personalToUpdate(driver, draft) {
  const fields = {}

  if ((draft.phone ?? '') !== (driver?.phone ?? '')) {
    fields.phone = draft.phone
  }
  if (normalizeEmail(draft.email) !== normalizeEmail(driver?.email)) {
    fields.email = normalizeEmail(draft.email)
  }

  return { fields, newPhotos: [] }
}

// ---------- Documentos (renovación y correo de Mercado Pago) ----------

// Documento -> borrador de la sección de documentos; las fotos quedan como URL y las fechas como Date
export function documentsToDraft(driver) {
  const documents = driver?.documents ?? {}
  return {
    licensePhoto: documents.licensePhotoURL ?? null,
    licenseExpiry: toDateOrNull(documents.licenseExpiry),
    soatPhoto: documents.soatPhotoURL ?? null,
    soatExpiry: toDateOrNull(documents.soatExpiry),
    inspectionPhoto: documents.inspectionPhotoURL ?? null,
    inspectionExpiry: toDateOrNull(documents.inspectionExpiry),
    mercadoPagoEmail: documents.mercadoPagoEmail ?? '',
  }
}

// Cada documento renovable: clave del borrador, campo de la foto y campo del vencimiento en Firestore
export const RENEWABLE_DOCUMENTS = [
  { key: 'license', photo: 'licensePhoto', expiry: 'licenseExpiry', photoField: 'documents.licensePhotoURL', expiryField: 'documents.licenseExpiry' },
  { key: 'soat', photo: 'soatPhoto', expiry: 'soatExpiry', photoField: 'documents.soatPhotoURL', expiryField: 'documents.soatExpiry' },
  { key: 'inspection', photo: 'inspectionPhoto', expiry: 'inspectionExpiry', photoField: 'documents.inspectionPhotoURL', expiryField: 'documents.inspectionExpiry' },
]

// Indica si el vencimiento del borrador es distinto al guardado
export const isExpiryChanged = (driver, draft, expiryKey) =>
  !isSameDay(draft[expiryKey] ?? null, toDateOrNull(driver?.documents?.[expiryKey]))

// Borrador -> campos a actualizar con rutas con punto (solo lo que cambió).
// Las fotos nuevas no van en fields: salen en newPhotos para subirlas antes de escribir
export function documentsToUpdate(driver, draft) {
  const documents = driver?.documents ?? {}
  const fields = {}
  const newPhotos = []

  RENEWABLE_DOCUMENTS.forEach(({ key, photo, expiry, photoField, expiryField }) => {
    if (isNewPhoto(draft[photo])) {
      newPhotos.push({ key, field: photoField, uri: draft[photo] })
    }
    if (draft[expiry] && isExpiryChanged(driver, draft, expiry)) {
      // Se envía como Date de JavaScript, igual que el registro
      fields[expiryField] = draft[expiry]
    }
  })

  if (normalizeEmail(draft.mercadoPagoEmail) !== normalizeEmail(documents.mercadoPagoEmail)) {
    fields['documents.mercadoPagoEmail'] = normalizeEmail(draft.mercadoPagoEmail)
  }

  return { fields, newPhotos }
}

// ---------- Comunes ----------

// Indica si hubo cambios (campos o fotos nuevas)
export const hasChanges = ({ fields, newPhotos }) =>
  Object.keys(fields).length > 0 || newPhotos.length > 0

// Agrega al resultado las URL de las fotos ya subidas: urlsByField = { 'documents.soatPhotoURL': 'https://…' }
export const mergeUploadedUrls = (fields, urlsByField) => ({ ...fields, ...urlsByField })

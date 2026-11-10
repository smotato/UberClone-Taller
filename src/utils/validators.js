// AI-assisted: see docs/AI_LOG.md #12
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/
const DIGITS_ONLY = /^\d+$/
const PLATE_REGEX = /^[A-Z]{3}\d{3}$/          // carro colombiano: ABC123
// Formato: parte local, @, dominio con etiquetas válidas y extensión de solo letras
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/

// Extensiones reales aceptadas: las genéricas más comunes y los códigos de país
const VALID_TLDS = new Set((
  'com net org edu gov mil int info biz name pro app dev xyz online site store shop tech cloud email live ' +
  'ac ad ae af ag ai al am ao aq ar as at au aw ax az ba bb bd be bf bg bh bi bj bm bn bo br bs bt bw by bz ' +
  'ca cc cd cf cg ch ci ck cl cm cn co cr cu cv cw cx cy cz de dj dk dm do dz ec ee eg er es et eu fi fj fk ' +
  'fm fo fr ga gd ge gf gg gh gi gl gm gn gp gq gr gt gu gw gy hk hn hr ht hu id ie il im in io iq ir is it ' +
  'je jm jo jp ke kg kh ki km kn kp kr kw ky kz la lb lc li lk lr ls lt lu lv ly ma mc md me mg mh mk ml mm ' +
  'mn mo mp mq mr ms mt mu mv mw mx my mz na nc ne nf ng ni nl no np nr nu nz om pa pe pf pg ph pk pl pm pn ' +
  'pr ps pt pw py qa re ro rs ru rw sa sb sc sd se sg sh si sk sl sm sn so sr ss st sv sx sy sz tc td tg th ' +
  'tj tk tl tm tn to tr tt tv tw tz ua ug uk us uy uz va vc ve vg vi vn vu wf ws ye yt za zm zw'
).split(' '))

const MIN_AGE = 18
const MIN_VEHICLE_YEAR = 1950
const XL_MIN_CAPACITY = 6
const MAX_CAPACITY = 20
// Años desde los que el vehículo exige revisión técnico-mecánica (confirmar con la profesora)
const INSPECTION_REQUIRED_AFTER_YEARS = 5

// ---------- Helpers ----------
const isEmpty = (value) => value === null || value === undefined || String(value).trim() === ''

// Inicio del día de mañana: una fecha "posterior a hoy" debe ser >= a este valor
const startOfTomorrow = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  return d
}

const calculateAge = (birthDate) => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const hadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!hadBirthday) age -= 1
  return age
}

// Se usa también en onChangeText del campo placa
export const normalizePlate = (value) => value.toUpperCase().replace(/\s/g, '')

// ---------- Pestaña 1: Datos personales ----------
export function validateProfilePhoto(uri) {
  return uri ? null : 'errors.photoRequired'
}

export function validateFullName(value) {
  const name = value.trim()
  if (!name) return 'errors.required'
  if (name.length > 50) return 'errors.nameTooLong'
  if (!NAME_REGEX.test(name)) return 'errors.onlyLetters'
  return null
}

export function validateIdNumber(value) {
  if (isEmpty(value)) return 'errors.required'
  if (!DIGITS_ONLY.test(value) || value.length < 6 || value.length > 10) return 'errors.invalidId'
  return null
}

export function validatePhone(value) {
  if (isEmpty(value)) return 'errors.required'
  if (!DIGITS_ONLY.test(value) || value.length !== 10) return 'errors.invalidPhone'
  return null
}

export function validateBirthDate(date) {
  if (!date) return 'errors.dateRequired'
  if (calculateAge(date) < MIN_AGE) return 'errors.underage'
  return null
}

// Sirve para género, idioma, categoría y color
export function validateSelect(value) {
  return isEmpty(value) ? 'errors.selectRequired' : null
}

export function validateEmail(value) {
  const email = (value ?? '').trim()
  if (!email) return 'errors.required'
  if (!EMAIL_REGEX.test(email)) return 'errors.invalidEmail'
  // La extensión (lo que va después del último punto) debe existir
  const tld = email.split('.').pop().toLowerCase()
  if (!VALID_TLDS.has(tld)) return 'errors.invalidEmail'
  return null
}

// ---------- Pestaña 2: Vehículo ----------
export function validatePlate(value) {
  const plate = normalizePlate(value)          // convertir a mayúsculas ANTES de validar
  if (!plate) return 'errors.required'
  if (!PLATE_REGEX.test(plate)) return 'errors.invalidPlate'
  return null
}

// Marca y modelo: texto obligatorio, máximo 30 caracteres
export function validateShortText(value) {
  const text = value.trim()
  if (!text) return 'errors.required'
  if (text.length > 30) return 'errors.maxLength30'
  return null
}

export function validateYear(value) {
  if (isEmpty(value)) return 'errors.required'
  if (!/^\d{4}$/.test(value)) return 'errors.invalidYear'
  const year = Number(value)
  const currentDate = new Date()

  if (currentDate.getMonth() < 4) {
    if (year > currentDate.getFullYear()) return 'errors.futureYear'
  } else {
    if (year > currentDate.getFullYear() + 1) return 'errors.invalidYear'
  }

  if (year < MIN_VEHICLE_YEAR) return 'errors.invalidYear'
  return null
}

// Depende de la categoría: XL exige mínimo 6 pasajeros
export function validateCapacity(value, category) {
  if (isEmpty(value)) return 'errors.required'
  if (!DIGITS_ONLY.test(value)) return 'errors.invalidCapacity'
  const capacity = Number(value)
  if (capacity < 1 || capacity > MAX_CAPACITY) return 'errors.invalidCapacity'
  if (category === 'xl' && capacity < XL_MIN_CAPACITY) return 'errors.xlMinCapacity'
  return null
}

export function validateVehiclePhoto(uri) {
  return uri ? null : 'errors.photoRequired'
}

// ---------- Pestaña 3: Documentos y pagos ----------
export function validateLicenseNumber(value) {
  if (isEmpty(value)) return 'errors.required'
  if (!DIGITS_ONLY.test(value) || value.length < 6 || value.length > 10) return 'errors.invalidLicense'
  return null
}

export function validateDocumentPhoto(uri) {
  return uri ? null : 'errors.photoRequired'
}

// Licencia, SOAT: fecha obligatoria y posterior a hoy
export function validateExpiryDate(date) {
  if (!date) return 'errors.dateRequired'
  if (date < startOfTomorrow()) return 'errors.expired'
  return null
}

// El año solo cuenta como ingresado cuando tiene los 4 dígitos
export const isYearEntered = (vehicleYear) => /^\d{4}$/.test(String(vehicleYear ?? ''))

// La revisión técnico-mecánica solo aplica según el año del vehículo.
// Sin año completo todavía no se sabe, así que no se exige.
export function isInspectionRequired(vehicleYear) {
  if (!isYearEntered(vehicleYear)) return false
  return new Date().getFullYear() - Number(vehicleYear) >= INSPECTION_REQUIRED_AFTER_YEARS
}

export function validateInspectionPhoto(uri, vehicleYear) {
  if (!isInspectionRequired(vehicleYear)) return null
  return uri ? null : 'errors.photoRequired'
}

export function validateInspectionExpiry(date, vehicleYear) {
  if (!isInspectionRequired(vehicleYear)) return null
  return validateExpiryDate(date)
}

export const validateMercadoPagoEmail = validateEmail

export function validateTerms(accepted) {
  return accepted === true ? null : 'errors.termsRequired'
}
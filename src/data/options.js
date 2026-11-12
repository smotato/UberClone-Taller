// AI-assisted: see docs/AI_LOG.md #6

// El value se guarda en inglés y no cambia; el texto visible sale de la clave de traducción
export const GENDER_OPTIONS = [
  { value: 'male', labelKey: 'options.gender.male' },
  { value: 'female', labelKey: 'options.gender.female' },
  { value: 'other', labelKey: 'options.gender.other' },
  { value: 'preferNotToSay', labelKey: 'options.gender.preferNotToSay' },
]

// Los idiomas se muestran siempre en su propio idioma, por eso usan label y no labelKey
export const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

// Categorías de vehículo (las mismas que ve el pasajero).
// El value se guarda en inglés; el texto sale de la clave de traducción.
// AI-assisted: see docs/AI_LOG.md #20
// Solo las tres categorías del taller; coinciden con los multiplicadores de tarifa
export const CATEGORY_OPTIONS = [
  { value: 'economy', labelKey: 'options.category.economy', descriptionKey: 'options.categoryDescription.economy' },
  { value: 'xl', labelKey: 'options.category.xl', descriptionKey: 'options.categoryDescription.xl' },
  { value: 'premium', labelKey: 'options.category.premium', descriptionKey: 'options.categoryDescription.premium' },
]

// Colores del vehiculo.
export const COLOR_OPTIONS = [
  { value: 'white', labelKey: 'options.color.white' },
  { value: 'black', labelKey: 'options.color.black' },
  { value: 'gray', labelKey: 'options.color.gray' },
  { value: 'silver', labelKey: 'options.color.silver' },
  { value: 'red', labelKey: 'options.color.red' },
  { value: 'blue', labelKey: 'options.color.blue' },
  { value: 'green', labelKey: 'options.color.green' },
  { value: 'yellow', labelKey: 'options.color.yellow' },
  { value: 'other', labelKey: 'options.color.other' },
]

// AI-assisted: see docs/AI_LOG.md #23
// Filtro del Historial por método de pago; 'all' no filtra
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'all', labelKey: 'history.paymentAll' },
  { value: 'cash', labelKey: 'history.paymentCash' },
  { value: 'stripe', labelKey: 'history.paymentStripe' },
]

// AI-assisted: see docs/AI_LOG.md #23
// Filtro del Historial por periodo; 'custom' habilita el rango de fechas
export const PERIOD_OPTIONS = [
  { value: 'today', labelKey: 'history.periodToday' },
  { value: 'week', labelKey: 'history.periodWeek' },
  { value: 'month', labelKey: 'history.periodMonth' },
  { value: 'custom', labelKey: 'history.periodCustom' },
]
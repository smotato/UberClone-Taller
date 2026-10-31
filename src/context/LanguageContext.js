// AI-assisted: see docs/AI_LOG.md #5

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import es from '../languages/es'
import en from '../languages/en'

// Diccionarios disponibles, indexados por el código de idioma
const translations = { es, en }

export const LanguageContext = createContext(null)

export  function LanguageProvider({ children }) {
  // Idioma por defecto: español
  const [language, setLanguage] = useState('es')

  // Convierte una clave como 'registration.personal.fullName' en su texto.
  // Si la clave no existe devuelve la propia clave, así se nota de inmediato qué falta.
  const t = useCallback(
    (key) => {
      const value = key
        .split('.')
        .reduce((node, part) => node?.[part], translations[language])
      return value ?? key
    },
    [language]
  )

  // useMemo evita que todos los consumidores se redibujen si el valor no cambió
  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

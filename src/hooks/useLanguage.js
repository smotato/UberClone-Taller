import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext"

export default function useLanguage() {
    const context = useContext(LanguageContext)

    if (!context) {
        throw new Error('useLanguage debe ser usado dentro de un <LanguageProvider>')
    }

  return context
}
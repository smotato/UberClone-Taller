import { useContext } from "react";
import { RegistrationContext } from "../context/RegistrationContext"

export default function useRegistration() {
    const context = useContext(RegistrationContext)

    if (!context) {
        throw new Error('useRegistration debe ser usado dentro de un <RegistrationProvider>')
    }

  return context
}
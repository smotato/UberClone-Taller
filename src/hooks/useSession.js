// AI-assisted: see docs/AI_LOG.md #18

import { useContext } from "react";
import { SessionContext } from "../context/SessionContext"

export default function useSession() {
    const context = useContext(SessionContext)

    if (!context) {
        throw new Error('useSession debe ser usado dentro de un <SessionProvider>')
    }

  return context
}

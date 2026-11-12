// AI-assisted: see docs/AI_LOG.md #25
import { useCallback, useEffect, useRef, useState } from 'react'
import { listenTripRequests, transitionTrip } from '../services/tripServices'
import { buildPatch } from '../utils/tripStateMachine'

// Solicitudes de viaje que le llegan al conductor, en tiempo real.
// - enabled: solo se escucha si el conductor está aprobado, disponible y sin un viaje activo.
// - Expone la solicitud más antigua (request) y el momento en que se vio por primera vez (receivedAt),
//   que es desde donde corre el temporizador de 15 s.
// - accept y reject se definen con useCallback y devuelven { ok: true, trip } o { ok: false, code }.
//   No muestran alertas: las pantallas deciden cómo avisar.
export default function useTripRequests({ enabled, driverId }) {
  const [request, setRequest] = useState(null)
  const [receivedAt, setReceivedAt] = useState(null)
  const [accepting, setAccepting] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const lastIdRef = useRef(null)
  // Evita toques repetidos mientras hay una escritura en curso
  const inFlightRef = useRef(false)

  // Suscripción en tiempo real; se cancela al deshabilitarse o desmontarse (función de limpieza)
  useEffect(() => {
    if (!enabled || !driverId) {
      lastIdRef.current = null
      setRequest(null)
      setReceivedAt(null)
      return undefined
    }

    const unsubscribe = listenTripRequests(
      driverId,
      (list) => {
        const next = list[0] ?? null
        setRequest(next)
        // El temporizador arranca cuando la solicitud se ve por primera vez, no cuando se crea en el servidor
        const nextId = next?.id ?? null
        if (nextId !== lastIdRef.current) {
          lastIdRef.current = nextId
          setReceivedAt(next ? Date.now() : null)
        }
      },
      () => {}
    )
    return unsubscribe
  }, [enabled, driverId])

  // Corre una transición sobre la solicitud actual y devuelve el resultado
  const run = useCallback(async (action, context, setFlag) => {
    if (!request || inFlightRef.current) return { ok: false, code: 'busy' }
    inFlightRef.current = true
    setFlag(true)
    try {
      const patch = buildPatch(action, { driverId, ...context })
      const trip = await transitionTrip(request.id, driverId, patch.expectedFrom, patch.fields)
      return { ok: true, trip }
    } catch (error) {
      return { ok: false, code: error?.code ?? 'failed' }
    } finally {
      inFlightRef.current = false
      setFlag(false)
    }
  }, [request, driverId])

  // context.metrics: { distanceKm, durationMin } estimados, si la solicitud no los traía (se guardan al aceptar)
  const accept = useCallback((context = {}) => run('accept', context, setAccepting), [run])

  // reason: 'declined' (el conductor la rechazó) o 'timeout' (se acabó el tiempo)
  const reject = useCallback((reason = 'declined') => run('reject', { reason }, setRejecting), [run])

  return { request, receivedAt, accepting, rejecting, accept, reject }
}

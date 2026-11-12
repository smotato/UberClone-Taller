// AI-assisted: see docs/AI_LOG.md #31
import { useEffect, useRef } from 'react'
import { AppState, Vibration } from 'react-native'
import {
  clearRequestNotifications,
  notifyNewRequest,
  requestNotificationPermission,
} from '../services/notificationServices'

// Patrón de vibración con la app abierta: pausa, vibra, pausa, vibra (milisegundos)
const VIBRATION_PATTERN = [0, 400, 200, 400]

// Avisa con sonido y vibración cuando llega una solicitud nueva. Con la app fuera de primer plano además muestra una
// notificación local; con la app abierta solo suena y vibra, porque la pantalla de solicitud ya está a la vista.
// - enabled: el conductor está aprobado, disponible y puede recibir solicitudes (se pide el permiso en ese momento).
// - request: la solicitud actual (la de useTripRequests); t: función de traducción.
// Se limpia sola: al volver a la app o al desaparecer la solicitud se quitan las notificaciones.
export default function useRequestNotifications({ enabled, request, t }) {
  const notifiedIdRef = useRef(null)
  const tRef = useRef(t)
  tRef.current = t

  // El permiso se pide al ponerse disponible, que es cuando el conductor espera solicitudes
  useEffect(() => {
    if (enabled) requestNotificationPermission()
  }, [enabled])

  // Solicitud nueva (con la app abierta o fuera de ella)
  const requestId = request?.id ?? null
  useEffect(() => {
    if (!enabled || !requestId) {
      notifiedIdRef.current = null
      clearRequestNotifications()
      return
    }
    if (notifiedIdRef.current === requestId) return
    notifiedIdRef.current = requestId
    // Con la app abierta también se avisa: vibración propia y sonido de la notificación (el aviso no se muestra)
    if (AppState.currentState === 'active') Vibration.vibrate(VIBRATION_PATTERN)
    const destination = request?.destination?.address
    notifyNewRequest({
      requestId,
      title: tRef.current('notifications.newRequestTitle'),
      body: destination
        ? `${tRef.current('notifications.newRequestBody')} ${destination}`
        : tRef.current('notifications.newRequestBodyNoDestination'),
    })
    // Solo depende del id a propósito: la misma solicitud no vuelve a avisar
  }, [enabled, requestId])

  // Al volver a la app se quitan las notificaciones: la pantalla de solicitud ya está a la vista
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') clearRequestNotifications()
    })
    return () => subscription.remove()
  }, [])
}

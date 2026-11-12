// AI-assisted: see docs/AI_LOG.md #25
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-native'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'
import useTripRequests from '../hooks/useTripRequests'
// AI-assisted: see docs/AI_LOG.md #31
import useRequestNotifications from '../hooks/useRequestNotifications'
import { listenTrip, findActiveTrip, transitionTrip } from '../services/tripServices'
// AI-assisted: see docs/AI_LOG.md #29
import { createPaymentIntent, confirmPayment } from '../services/paymentsServices'
import { getDistanceMatrix, getDirections } from '../services/routesServices'
import { buildPatch, screenForTrip } from '../utils/tripStateMachine'
import { navigationRef } from '../navigation/navigationRef'
import { WRITE_TIMEOUT_MS } from '../config/tripFlow'

// Espera antes de volver a Inicio cuando ya no hay pantalla del viaje: evita parpadeos entre dos cambios seguidos
const HOME_DELAY_MS = 400
// Tras una acción propia (aceptar o rechazar) no se avisa "ya no está disponible" aunque la solicitud desaparezca
const OWN_ACTION_WINDOW_MS = 5000
// Reintento cuando el navegador aún no está listo (por ejemplo, al retomar un viaje al abrir la app)
const NAV_RETRY_MS = 300

const hasMetrics = (trip) =>
  Number.isFinite(trip?.distanceKm) && Number.isFinite(trip?.durationMin)

// Tramos de ruta del viaje: 'pickup' (conductor -> recogida) y 'dropoff' (recogida -> destino).
// status: 'idle' | 'loading' | 'ready' | 'failed'. Cada tramo se pide una sola vez por viaje
const IDLE_LEG = { status: 'idle', points: [], distanceKm: null, durationMin: null }
const emptyLegs = (tripId = null) => ({ tripId, pickup: IDLE_LEG, dropoff: IDLE_LEG })

export const TripContext = createContext(null)

// Viaje activo y solicitudes entrantes. Decide qué pantalla del flujo se muestra según el estado del viaje
// (screenForTrip) y navega con navigationRef. Las acciones devuelven { ok: true, trip } o { ok: false, code };
// las pantallas deciden cómo avisar los errores.
export function TripProvider({ children }) {
  const { t } = useLanguage()
  const { driverId, driver, isApproved, sessionState } = useSession()
  const loggedIn = sessionState === 'loggedIn' && Boolean(driverId)

  const [activeTrip, setActiveTrip] = useState(null)
  const [restoring, setRestoring] = useState(false)
  const [busy, setBusy] = useState(false)
  // Distancia y duración de la solicitud cuando no las trae; se piden a Distance Matrix una sola vez por solicitud
  const [estimate, setEstimate] = useState({ id: null, status: 'idle', value: null })
  const [navTick, setNavTick] = useState(0)
  const [legsState, setLegsState] = useState(() => emptyLegs())

  const busyRef = useRef(false)
  // Tramos ya pedidos ("idDelViaje:tramo"): evita repetir la llamada al proveedor de rutas
  const legRequestsRef = useRef(new Set())
  const activeIdRef = useRef(null)
  const selfCancelRef = useRef(false)
  const ownActionUntilRef = useRef(0)
  const lastScreenRef = useRef(null)
  const homeTimerRef = useRef(null)
  // La traducción se lee desde una referencia para que cambiar de idioma no reinicie los efectos de navegación
  const tRef = useRef(t)
  tRef.current = t

  // Solo se escuchan solicitudes si la cuenta está aprobada, el conductor está disponible y no hay un viaje activo
  const requestsEnabled = loggedIn && isApproved && driver?.isAvailable === true && !activeTrip && !restoring
  const requests = useTripRequests({ enabled: requestsEnabled, driverId })
  const request = requests.request

  // AI-assisted: see docs/AI_LOG.md #31
  // Notificación local si llega una solicitud con la app fuera de primer plano
  useRequestNotifications({ enabled: requestsEnabled, request, t })

  // Al cerrar sesión se limpia todo
  useEffect(() => {
    if (loggedIn) return
    setActiveTrip(null)
    setRestoring(false)
  }, [loggedIn])

  // Al iniciar sesión se retoma un viaje en curso, si lo hay (por ejemplo, tras cerrar y reabrir la app)
  useEffect(() => {
    if (!loggedIn) return undefined
    let cancelled = false
    setRestoring(true)
    // Sin red la búsqueda puede tardar: pasado el tiempo máximo se dejan de bloquear las solicitudes,
    // y si el viaje aparece después igualmente se retoma
    const giveUp = setTimeout(() => { if (!cancelled) setRestoring(false) }, WRITE_TIMEOUT_MS)
    findActiveTrip(driverId)
      .then((trip) => { if (!cancelled && trip) setActiveTrip(trip) })
      .catch(() => {})
      .finally(() => {
        clearTimeout(giveUp)
        if (!cancelled) setRestoring(false)
      })
    return () => {
      cancelled = true
      clearTimeout(giveUp)
    }
  }, [loggedIn, driverId])

  // Escucha en vivo el viaje activo (por ejemplo, para enterarse de una cancelación del pasajero)
  const activeId = activeTrip?.id ?? null
  activeIdRef.current = activeId
  useEffect(() => {
    if (!activeId) return undefined
    return listenTrip(activeId, (trip) => setActiveTrip(trip), () => {})
  }, [activeId])

  // Sin viaje activo se olvidan los tramos de ruta
  useEffect(() => {
    if (activeId) return
    legRequestsRef.current.clear()
    setLegsState(emptyLegs())
  }, [activeId])

  // Un viaje cancelado se limpia; si lo canceló el pasajero, se avisa
  useEffect(() => {
    if (activeTrip?.status !== 'cancelled') return
    if (!selfCancelRef.current) Alert.alert(tRef.current('tripFlow.cancelledByPassengerTitle'), tRef.current('tripFlow.cancelledByPassenger'))
    selfCancelRef.current = false
    setActiveTrip(null)
  }, [activeTrip?.status])

  // Si la solicitud no trae distancia y duración, se calculan con Distance Matrix (una vez por solicitud)
  const requestId = request?.id ?? null
  useEffect(() => {
    if (!request || hasMetrics(request)) {
      setEstimate({ id: null, status: 'idle', value: null })
      return undefined
    }
    let cancelled = false
    setEstimate({ id: request.id, status: 'loading', value: null })
    getDistanceMatrix(request.origin, request.destination).then((value) => {
      if (!cancelled) setEstimate({ id: request.id, status: value ? 'ready' : 'failed', value })
    })
    return () => { cancelled = true }
    // Solo depende del id a propósito: una misma solicitud no vuelve a llamar al proveedor de rutas
  }, [requestId])

  // Navegación automática: la pantalla depende del estado del viaje
  const target = screenForTrip(activeTrip, request)
  useEffect(() => {
    clearTimeout(homeTimerRef.current)

    if (!loggedIn) {
      lastScreenRef.current = null
      return undefined
    }

    if (target) {
      if (target === lastScreenRef.current) return undefined
      if (!navigationRef.isReady()) {
        const retry = setTimeout(() => setNavTick((tick) => tick + 1), NAV_RETRY_MS)
        return () => clearTimeout(retry)
      }
      navigationRef.navigate(target)
      lastScreenRef.current = target
      return undefined
    }

    // Ya no hay pantalla del flujo: se vuelve a Inicio con una pequeña espera
    if (lastScreenRef.current) {
      homeTimerRef.current = setTimeout(() => {
        const from = lastScreenRef.current
        lastScreenRef.current = null
        if (navigationRef.isReady()) navigationRef.navigate('Main')
        // Si la solicitud desapareció sin que el conductor hiciera nada (cancelada o tomada), se avisa
        if (from === 'IncomingRequest' && Date.now() > ownActionUntilRef.current) {
          Alert.alert(tRef.current('request.unavailableTitle'), tRef.current('request.unavailable'))
        }
      }, HOME_DELAY_MS)
      return () => clearTimeout(homeTimerRef.current)
    }
    return undefined
  }, [target, loggedIn, navTick])

  // ---------- Acciones de la solicitud ----------

  const { accept: acceptRequest, reject: rejectRequest } = requests

  const accept = useCallback(async () => {
    ownActionUntilRef.current = Date.now() + OWN_ACTION_WINDOW_MS
    // Si la solicitud no traía distancia y duración, la estimación de Distance Matrix se guarda en el viaje al aceptar,
    // para poder calcular la tarifa final aunque la ruta falle o se cierre la app
    const estimated = request && !hasMetrics(request) && estimate.id === request.id && estimate.status === 'ready'
    const result = await acceptRequest(estimated ? { metrics: estimate.value } : {})
    if (result.ok) setActiveTrip(result.trip)
    return result
  }, [acceptRequest, request, estimate])

  const reject = useCallback((reason) => {
    ownActionUntilRef.current = Date.now() + OWN_ACTION_WINDOW_MS
    return rejectRequest(reason)
  }, [rejectRequest])

  // ---------- Rutas del viaje ----------

  // Pide un tramo de ruta una sola vez por viaje (nunca por cada movimiento). from y to son { lat, lng }.
  // Si el proveedor falla o no hay llave, el tramo queda en 'failed' y el mapa dibuja la línea recta de respaldo
  const loadLeg = useCallback(async (kind, from, to) => {
    const tripId = activeIdRef.current
    const key = `${tripId}:${kind}`
    if (!tripId || legRequestsRef.current.has(key)) return
    legRequestsRef.current.add(key)

    setLegsState((prev) => ({
      ...(prev.tripId === tripId ? prev : emptyLegs(tripId)),
      [kind]: { ...IDLE_LEG, status: 'loading' },
    }))
    const result = await getDirections(from, to)
    // Si mientras tanto cambió el viaje, la respuesta se descarta
    setLegsState((prev) => {
      if (prev.tripId !== tripId) return prev
      const leg = result
        ? { status: 'ready', points: result.points, distanceKm: result.distanceKm, durationMin: result.durationMin }
        : { ...IDLE_LEG, status: 'failed' }
      return { ...prev, [kind]: leg }
    })
  }, [])

  const legs = useMemo(
    () => (legsState.tripId === activeId ? legsState : emptyLegs(activeId)),
    [legsState, activeId]
  )

  // ---------- Acciones del viaje activo ----------

  // Corre una transición sobre el viaje activo. Ignora toques repetidos mientras hay una escritura en curso
  const runTransition = useCallback(async (action, extraContext = {}) => {
    if (!activeTrip || busyRef.current) return { ok: false, code: 'busy' }
    busyRef.current = true
    setBusy(true)
    try {
      const patch = buildPatch(action, { driverId, trip: activeTrip, ...extraContext })
      const trip = await transitionTrip(activeTrip.id, driverId, patch.expectedFrom, patch.fields)
      setActiveTrip(trip)
      return { ok: true, trip }
    } catch (error) {
      return { ok: false, code: error?.code ?? 'failed' }
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [activeTrip, driverId])

  const startArriving = useCallback(() => runTransition('startArriving'), [runTransition])
  const passengerOnBoard = useCallback(() => runTransition('passengerOnBoard'), [runTransition])

  // destinationLeg: { distanceKm, durationMin } del tramo recogida -> destino; routePoints: puntos de la ruta recorrida
  const finishTrip = useCallback(
    ({ destinationLeg = null, routePoints = [] } = {}) =>
      runTransition('finish', { destinationLeg, routePoints }),
    [runTransition]
  )

  const cancelTrip = useCallback(async () => {
    selfCancelRef.current = true
    const result = await runTransition('cancel')
    if (!result.ok) selfCancelRef.current = false
    return result
  }, [runTransition])

  const collectCash = useCallback(() => runTransition('collectCash'), [runTransition])

  // Solo desarrollo: simula la respuesta de la pasarela (sin backend todavía)
  const simulateGatewayResult = useCallback(
    (approved) => (__DEV__
      ? runTransition(approved ? 'gatewayApproved' : 'gatewayRejected')
      : Promise.resolve({ ok: false, code: 'unavailable' })),
    [runTransition]
  )

  // AI-assisted: see docs/AI_LOG.md #29
  // Cobro con tarjeta (Stripe, vía el servidor de pagos). Solo con un viaje terminado y de método 'stripe'.
  // Ignoran toques repetidos; el estado final del viaje llega por listenTrip (la app nunca escribe 'paid')
  const runPayment = useCallback(async (request) => {
    if (!activeTrip || busyRef.current) return { ok: false, code: 'busy' }
    if (activeTrip.status !== 'completed' || activeTrip.paymentMethod !== 'stripe') return { ok: false, code: 'not_payable' }
    busyRef.current = true
    setBusy(true)
    try {
      return await request(activeTrip.id)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [activeTrip])

  const createCardPayment = useCallback(
    (attemptId) => runPayment((tripId) => createPaymentIntent(tripId, attemptId)),
    [runPayment]
  )
  const confirmCardPayment = useCallback(
    (paymentIntentId) => runPayment((tripId) => confirmPayment(tripId, paymentIntentId)),
    [runPayment]
  )

  // Sale del resumen: se limpia el viaje y el controlador vuelve a Inicio
  const leaveSummary = useCallback(() => setActiveTrip(null), [])

  const value = useMemo(
    () => ({
      request,
      receivedAt: requests.receivedAt,
      requestEstimate: estimate,
      accepting: requests.accepting,
      rejecting: requests.rejecting,
      activeTrip,
      legs,
      loadLeg,
      restoring,
      busy,
      accept,
      reject,
      startArriving,
      passengerOnBoard,
      finishTrip,
      cancelTrip,
      collectCash,
      simulateGatewayResult,
      createCardPayment,
      confirmCardPayment,
      leaveSummary,
    }),
    [request, requests.receivedAt, requests.accepting, requests.rejecting, estimate, activeTrip, legs, loadLeg, restoring, busy,
      accept, reject, startArriving, passengerOnBoard, finishTrip, cancelTrip, collectCash, simulateGatewayResult, createCardPayment, confirmCardPayment, leaveSummary]
  )

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

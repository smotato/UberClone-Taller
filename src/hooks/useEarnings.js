// AI-assisted: see docs/AI_LOG.md #23
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import useSession from './useSession'
import { listenPaidTripsSince, getTripsBalance } from '../services/tripServices'
import { splitByPeriod } from '../utils/earningsSummary'
import { startOfEarliestPeriod } from '../utils/dateRanges'

// Estado inicial del saldo: cargando, sin valor
const INITIAL_BALANCE = { balance: null, loading: true, error: false, mismatch: false }

// Datos de la pantalla Ganancias.
// - Periodos (hoy, semana, mes): una consulta aparte del Historial, acotada por fecha y sin tope de documentos,
//   así los totales nunca salen incompletos. Los totales se calculan con useMemo sobre esa lista.
// - Saldo: agregaciones de Firestore sobre TODOS los viajes pagados. No escuchan cambios, así que se recarga
//   al enfocar la pantalla, cuando llega un viaje pagado nuevo, con el gesto de actualizar y con Reintentar.
export default function useEarnings() {
  const { driverId } = useSession()

  // Hora de referencia de los periodos; se renueva cada vez que la pantalla gana el foco
  const [now, setNow] = useState(() => new Date())
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [balanceState, setBalanceState] = useState(INITIAL_BALANCE)
  // Cambiar este número vuelve a suscribir y a cargar el saldo (gesto de actualizar y Reintentar)
  const [reloadKey, setReloadKey] = useState(0)
  const [reloading, setReloading] = useState(false)

  const hasLoadedRef = useRef(false)
  const balanceRequestRef = useRef(0)
  const lastSignatureRef = useRef(null)

  // Carga el saldo. Es todo o nada: si falla cualquier consulta, no queda ningún total parcial.
  // El contador de peticiones descarta respuestas viejas y las de una pantalla ya desmontada
  const loadBalance = useCallback(async () => {
    if (!driverId) return
    const request = ++balanceRequestRef.current
    setBalanceState((current) => ({ ...current, loading: true, error: false }))
    try {
      const result = await getTripsBalance(driverId)
      if (request !== balanceRequestRef.current) return
      setBalanceState({ balance: result.balance, loading: false, error: false, mismatch: result.mismatch })
    } catch {
      if (request !== balanceRequestRef.current) return
      setBalanceState({ balance: null, loading: false, error: true, mismatch: false })
    }
  }, [driverId])

  // Al desmontar, las respuestas pendientes del saldo se descartan
  useEffect(() => () => { balanceRequestRef.current += 1 }, [])

  // Al enfocar la pantalla: renueva la hora, se suscribe a los viajes pagados del periodo más antiguo
  // y recarga el saldo. Al salir del foco o desmontar, cancela la suscripción (función de limpieza)
  useFocusEffect(
    useCallback(() => {
      if (!driverId) return undefined
      const current = new Date()
      setNow(current)
      setError(false)
      if (!hasLoadedRef.current) setLoading(true)

      const unsubscribe = listenPaidTripsSince(
        driverId,
        startOfEarliestPeriod(current).getTime(),
        (list) => {
          hasLoadedRef.current = true
          setTrips(list)
          setError(false)
          setLoading(false)
        },
        () => {
          setError(true)
          setLoading(false)
        }
      )
      loadBalance()
      return unsubscribe
    }, [driverId, loadBalance, reloadKey])
  )

  // Un viaje pagado nuevo (por ejemplo, tras cerrar un cobro) cambia la lista: el saldo se recarga.
  // La primera lista no cuenta, porque el saldo ya se cargó al enfocar
  const signature = useMemo(() => trips.map((trip) => trip.id).join('|'), [trips])
  useEffect(() => {
    if (loading) return
    if (lastSignatureRef.current === null) {
      lastSignatureRef.current = signature
      return
    }
    if (lastSignatureRef.current !== signature) {
      lastSignatureRef.current = signature
      loadBalance()
    }
  }, [signature, loading, loadBalance])

  // Totales de hoy, semana (desde el lunes) y mes, solo con viajes pagados
  const periods = useMemo(() => splitByPeriod(trips, now), [trips, now])

  // Gesto de actualizar: vuelve a suscribir y a cargar el saldo
  const reload = useCallback(() => {
    setReloading(true)
    // El saldo pasa a "cargando" ya, para que el indicador no se apague antes de que empiece la consulta
    setBalanceState((current) => ({ ...current, loading: true }))
    setReloadKey((key) => key + 1)
  }, [])

  // El indicador del gesto se apaga cuando terminan ambas cargas
  useEffect(() => {
    if (reloading && !loading && !balanceState.loading) setReloading(false)
  }, [reloading, loading, balanceState.loading])

  return {
    today: periods.today,
    week: periods.week,
    month: periods.month,
    hasTrips: trips.length > 0,
    loading,
    error,
    reloading,
    balance: balanceState.balance,
    balanceLoading: balanceState.loading,
    balanceError: balanceState.error,
    balanceMismatch: balanceState.mismatch,
    reload,
    reloadBalance: loadBalance,
  }
}

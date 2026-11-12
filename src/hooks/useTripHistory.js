// AI-assisted: see docs/AI_LOG.md #23
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import useSession from './useSession'
import { fetchTripsPage } from '../services/tripServices'
import { getRange } from '../utils/dateRanges'

// Estado inicial: sin viajes y cargando la primera página
const INITIAL_STATE = {
  trips: [],
  cursor: null,
  hasMore: false,
  loading: true,
  loadingMore: false,
  refreshing: false,
  error: false,
}

// Une dos listas sin repetir viajes (por id), conservando el orden
const mergeTrips = (current, incoming) => {
  const seen = new Set(current.map((trip) => trip.id))
  return [...current, ...incoming.filter((trip) => !seen.has(trip.id))]
}

// Historial paginado de viajes (de a 20, del más reciente al más antiguo por completedAt).
// filters = { period: 'today' | 'week' | 'month' | 'custom', customFrom, customTo, paymentMethod: 'all' | 'cash' | ... }
// Con un rango personalizado incompleto o invertido no consulta nada (hasRange es false).
export default function useTripHistory({ period, customFrom, customTo, paymentMethod }) {
  const { driverId } = useSession()
  const [state, setState] = useState(INITIAL_STATE)
  // Cambiar este número vuelve a pedir la primera página (cambio de periodo del día, gesto de actualizar, volver al foco)
  const [nonce, setNonce] = useState(0)

  const requestRef = useRef(0)
  // Si es true, la próxima carga conserva la lista visible mientras se actualiza
  const silentRef = useRef(false)
  const focusedOnceRef = useRef(false)

  // Rango de fechas con la hora local. nonce está en las dependencias a propósito: al actualizar
  // se recalcula, para que "Hoy" no quede viejo si la app estuvo abierta pasada la medianoche
  const range = useMemo(
    () => getRange(period, customFrom, customTo),
    [period, customFrom, customTo, nonce]
  )
  const rangeFrom = range?.from
  const rangeTo = range?.to
  const method = paymentMethod && paymentMethod !== 'all' ? paymentMethod : null

  // Primera página: se pide al cambiar el conductor, el rango o el método de pago.
  // El contador de peticiones descarta respuestas viejas (si los filtros cambian mientras carga)
  useEffect(() => {
    if (!driverId) return undefined
    const silent = silentRef.current
    silentRef.current = false
    const request = ++requestRef.current

    if (rangeFrom === undefined) {
      setState({ ...INITIAL_STATE, loading: false })
      return () => { requestRef.current += 1 }
    }

    setState((current) => ({
      ...current,
      trips: silent ? current.trips : [],
      cursor: silent ? current.cursor : null,
      hasMore: silent ? current.hasMore : false,
      loading: !silent,
      loadingMore: false,
      error: false,
    }))

    fetchTripsPage(driverId, { from: rangeFrom, to: rangeTo, paymentMethod: method })
      .then((page) => {
        if (request !== requestRef.current) return
        setState({
          trips: page.trips,
          cursor: page.cursor,
          hasMore: page.hasMore,
          loading: false,
          loadingMore: false,
          refreshing: false,
          error: false,
        })
      })
      .catch(() => {
        if (request !== requestRef.current) return
        // Se conserva lo que ya estaba cargado
        setState((current) => ({ ...current, loading: false, loadingMore: false, refreshing: false, error: true }))
      })

    return () => { requestRef.current += 1 }
  }, [driverId, rangeFrom, rangeTo, method, nonce])

  // Siguiente página. force=true se usa al reintentar tras un error
  const fetchMore = useCallback(async (force) => {
    const { loading, loadingMore, refreshing, hasMore, error, cursor } = state
    if (!driverId || rangeFrom === undefined) return
    if (loading || loadingMore || refreshing || !hasMore || (error && !force)) return

    const request = requestRef.current
    setState((current) => ({ ...current, loadingMore: true, error: false }))
    try {
      const page = await fetchTripsPage(driverId, { from: rangeFrom, to: rangeTo, paymentMethod: method, cursor })
      if (request !== requestRef.current) return
      setState((current) => ({
        ...current,
        trips: mergeTrips(current.trips, page.trips),
        cursor: page.cursor,
        hasMore: page.hasMore,
        loadingMore: false,
      }))
    } catch {
      if (request !== requestRef.current) return
      setState((current) => ({ ...current, loadingMore: false, error: true }))
    }
  }, [state, driverId, rangeFrom, rangeTo, method])

  const loadMore = useCallback(() => fetchMore(false), [fetchMore])

  // Gesto de actualizar: vuelve a pedir la primera página sin vaciar la lista
  const refresh = useCallback(() => {
    silentRef.current = true
    setState((current) => ({ ...current, refreshing: true }))
    setNonce((value) => value + 1)
  }, [])

  // Reintentar: si ya hay viajes, vuelve a pedir la siguiente página; si no, la primera
  const retry = useCallback(() => {
    if (state.trips.length > 0) {
      fetchMore(true)
    } else {
      silentRef.current = false
      setNonce((value) => value + 1)
    }
  }, [state.trips.length, fetchMore])

  // Al volver a la pantalla (por ejemplo, tras cargar viajes de ejemplo) se actualiza la lista sin vaciarla.
  // La primera vez no, porque la carga inicial ya la hace el efecto de arriba
  useFocusEffect(
    useCallback(() => {
      if (!focusedOnceRef.current) {
        focusedOnceRef.current = true
        return
      }
      silentRef.current = true
      setNonce((value) => value + 1)
    }, [])
  )

  return {
    trips: state.trips,
    loading: state.loading,
    loadingMore: state.loadingMore,
    refreshing: state.refreshing,
    hasMore: state.hasMore,
    error: state.error,
    hasRange: range !== null,
    loadMore,
    refresh,
    retry,
  }
}

// AI-assisted: see docs/AI_LOG.md #25
import { useEffect, useRef, useState } from 'react'

// Segundos que quedan según la hora de inicio; nunca baja de 0
const secondsRemaining = (seconds, startedAt) =>
  Math.max(0, Math.ceil(seconds - (Date.now() - startedAt) / 1000))

// Intervalo de revisión: corto para que el número cambie justo al cumplirse cada segundo
const TICK_MS = 250

// Cuenta regresiva que se calcula con la hora real (Date.now()) y no sumando ticks, así resiste re-renders y que la app
// pase un rato en segundo plano. Se reinicia cuando cambia startedAt (por ejemplo, una solicitud nueva).
// Con startedAt nulo no corre. onExpire se llama una sola vez por cuenta, cuando llega a cero.
// El intervalo se limpia en la función de limpieza del useEffect.
export default function useCountdown(seconds, onExpire, startedAt) {
  const [secondsLeft, setSecondsLeft] = useState(() => (startedAt ? secondsRemaining(seconds, startedAt) : seconds))
  // La referencia evita reiniciar el intervalo cada vez que cambia la función onExpire
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!startedAt) {
      setSecondsLeft(seconds)
      return undefined
    }

    let expired = false
    const tick = () => {
      const left = secondsRemaining(seconds, startedAt)
      setSecondsLeft(left)
      if (left <= 0 && !expired) {
        expired = true
        clearInterval(interval)
        onExpireRef.current?.()
      }
    }
    const interval = setInterval(tick, TICK_MS)
    tick()

    return () => clearInterval(interval)
  }, [seconds, startedAt])

  return { secondsLeft }
}

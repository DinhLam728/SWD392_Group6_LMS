import { useEffect, useRef, useState } from 'react'

function format(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function CountdownTimer({ endAt, onExpire }) {
  const [remaining, setRemaining] = useState(null)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    const tick = () => {
      const left = endAt - Date.now()
      setRemaining(left)
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current()
      }
    }
    const timer = setInterval(tick, 1000)
    const first = setTimeout(tick, 0)
    return () => {
      clearInterval(timer)
      clearTimeout(first)
    }
  }, [endAt])

  const warning = remaining !== null && remaining <= 60_000
  return (
    <div
      className={`quiz-timer ${warning ? 'quiz-timer-warning' : ''}`}
      role="timer"
      aria-live={warning ? 'assertive' : 'off'}
    >
      <span>Thời gian còn lại</span>
      <strong>{remaining === null ? '--:--' : format(remaining)}</strong>
    </div>
  )
}

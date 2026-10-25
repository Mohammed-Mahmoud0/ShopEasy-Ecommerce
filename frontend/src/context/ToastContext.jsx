import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ToastContext } from './toast'

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (message, type = 'info', duration = 3500) => {
      idCounter += 1
      const id = idCounter
      setToasts((current) => [...current, { id, message, type }])
      const timer = setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
      return id
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      toast: {
        show: push,
        success: (message, duration) => push(message, 'success', duration),
        error: (message, duration) => push(message, 'error', duration),
        info: (message, duration) => push(message, 'info', duration),
      },
    }),
    [toasts, dismiss, push],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

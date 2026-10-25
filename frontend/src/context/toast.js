import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context.toast
}

export function useToastList() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastList must be used within a ToastProvider')
  }
  return { toasts: context.toasts, dismiss: context.dismiss }
}

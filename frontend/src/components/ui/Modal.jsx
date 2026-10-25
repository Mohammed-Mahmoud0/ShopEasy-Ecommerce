import { useEffect } from 'react'
import { Icon } from '../Icon'

export function Modal({ isOpen, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_150ms_ease]"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-lg overflow-hidden rounded-2xl app-surface animate-[popIn_180ms_ease] ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-lg font-semibold text-app">{title}</h2>
            <button
              className="app-focus grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-[var(--bg-soft)] hover:text-app"
              onClick={onClose}
              type="button"
              aria-label="Close"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

import { useToastList } from '../../context/toast'
import { Icon } from '../Icon'

const config = {
  success: { icon: 'check', accent: 'text-emerald-500', ring: 'border-emerald-500/30' },
  error: { icon: 'alert', accent: 'text-rose-500', ring: 'border-rose-500/30' },
  info: { icon: 'info', accent: 'text-sky-500', ring: 'border-sky-500/30' },
}

export function Toaster() {
  const { toasts, dismiss } = useToastList()

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((toast) => {
        const style = config[toast.type] || config.info
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border app-surface px-4 py-3 shadow-lg animate-[slideUp_200ms_ease] ${style.ring}`}
            role="status"
          >
            <span className={`mt-0.5 shrink-0 ${style.accent}`}>
              <Icon name={style.icon} className="h-5 w-5" />
            </span>
            <p className="flex-1 text-sm font-medium text-app">{toast.message}</p>
            <button
              className="app-focus -m-1 shrink-0 rounded p-1 text-muted transition hover:text-app"
              onClick={() => dismiss(toast.id)}
              type="button"
              aria-label="Dismiss"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

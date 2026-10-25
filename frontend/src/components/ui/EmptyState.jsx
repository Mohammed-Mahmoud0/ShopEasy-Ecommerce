import { Icon } from '../Icon'

export function EmptyState({ icon = 'box', title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl app-panel px-6 py-16 text-center ${className}`}
    >
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] text-[var(--brand)]">
        <Icon name={icon} className="h-7 w-7" />
      </div>
      {title && (
        <h3 className="mt-5 text-lg font-semibold text-app">{title}</h3>
      )}
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

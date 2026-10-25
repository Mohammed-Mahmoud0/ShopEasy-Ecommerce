import { Icon } from '../Icon'

export function QtyStepper({ value, onChange, min = 1, max = Infinity, size = 'md' }) {
  const height = size === 'sm' ? 'h-9' : 'h-11'
  const btn = size === 'sm' ? 'w-9' : 'w-11'

  const decrement = () => onChange(Math.max(min, value - 1))
  const increment = () => onChange(Math.min(max, value + 1))

  return (
    <div
      className={`inline-flex ${height} items-center overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)]`}
    >
      <button
        className={`grid ${btn} h-full place-items-center text-muted transition hover:bg-[var(--bg-soft)] hover:text-app disabled:opacity-40`}
        onClick={decrement}
        disabled={value <= min}
        type="button"
        aria-label="Decrease quantity"
      >
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <span className="grid min-w-9 place-items-center px-1 text-sm font-semibold text-app tabular-nums">
        {value}
      </span>
      <button
        className={`grid ${btn} h-full place-items-center text-muted transition hover:bg-[var(--bg-soft)] hover:text-app disabled:opacity-40`}
        onClick={increment}
        disabled={value >= max}
        type="button"
        aria-label="Increase quantity"
      >
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  )
}

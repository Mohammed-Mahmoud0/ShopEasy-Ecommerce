const tones = {
  brand:
    'bg-[color-mix(in_srgb,var(--brand)_14%,transparent)] text-[var(--brand)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  neutral: 'bg-[var(--bg-soft)] text-muted',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
}

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        tones[tone] || tones.neutral
      } ${className}`}
    >
      {children}
    </span>
  )
}

const base =
  'app-focus inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'

const variants = {
  primary: 'app-button-primary disabled:shadow-none',
  dark: 'app-button-dark',
  outline:
    'app-panel text-app hover:border-[var(--brand)] hover:text-[var(--brand)]',
  ghost: 'text-muted hover:bg-[var(--bg-soft)] hover:text-app',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-900/20',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
}

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  children,
  ...props
}) {
  return (
    <Component
      className={`${base} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      {...(Component === 'button' && !props.type ? { type: 'button' } : {})}
      {...props}
    >
      {children}
    </Component>
  )
}

import { useTheme } from '../hooks/useTheme'
import { Icon } from '../components/Icon'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      className="app-panel app-focus grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted transition hover:text-[var(--brand)]"
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      <Icon name={isDark ? 'sun' : 'moon'} className="h-5 w-5" />
    </button>
  )
}

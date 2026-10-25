import { useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('shopeasy:theme', 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [setTheme],
  )

  return { theme, setTheme, toggleTheme }
}

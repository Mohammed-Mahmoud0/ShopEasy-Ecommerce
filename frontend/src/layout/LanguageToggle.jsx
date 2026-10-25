import { useLanguage } from '../context/language'
import { Icon } from '../components/Icon'

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage()

  return (
    <button
      className="app-panel app-focus inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-muted transition hover:text-[var(--brand)]"
      onClick={toggleLang}
      type="button"
      title="Switch language"
      aria-label="Switch language"
    >
      <Icon name="globe" className="h-4 w-4" />
      <span className="uppercase">{lang === 'ar' ? 'EN' : 'ع'}</span>
    </button>
  )
}

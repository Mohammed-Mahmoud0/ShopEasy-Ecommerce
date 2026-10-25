import { useCallback, useEffect, useMemo } from 'react'
import { dictionary, LANGUAGES } from '../i18n/dictionary'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { LanguageContext } from './language'

const interpolate = (template, params) => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    params[key] !== undefined ? String(params[key]) : match,
  )
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useLocalStorage('shopeasy:lang', 'en')

  const dir = useMemo(
    () => LANGUAGES.find((item) => item.code === lang)?.dir || 'ltr',
    [lang],
  )

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', dir)
  }, [lang, dir])

  const t = useCallback(
    (key, params) => {
      const table = dictionary[lang] || dictionary.en
      const template = table[key] ?? dictionary.en[key] ?? key
      return interpolate(template, params)
    },
    [lang],
  )

  // Return the localized field of an API object, e.g. pick(product, 'title')
  // falls back to the base field when the *_ar value is missing.
  const pick = useCallback(
    (obj, field) => {
      if (!obj) return ''
      if (lang === 'ar') {
        const localized = obj[`${field}_ar`]
        if (localized) return localized
      }
      return obj[field] || ''
    },
    [lang],
  )

  const toggleLang = useCallback(
    () => setLang((current) => (current === 'ar' ? 'en' : 'ar')),
    [setLang],
  )

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, dir, t, pick, languages: LANGUAGES }),
    [lang, setLang, toggleLang, dir, t, pick],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

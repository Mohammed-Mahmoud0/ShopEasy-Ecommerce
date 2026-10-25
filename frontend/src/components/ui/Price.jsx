import { useLanguage } from '../../context/language'
import { formatMoney } from '../../utils/format'

export function Price({ value, className = '' }) {
  const { lang } = useLanguage()
  return <span className={className}>{formatMoney(value, lang)}</span>
}

import { Link } from 'react-router-dom'
import { useLanguage } from '../context/language'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/Icon'

export function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-4 text-center">
      <div>
        <p className="text-7xl font-bold text-[var(--brand)]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-app">{t('notFound.title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('notFound.body')}</p>
        <Button as={Link} to="/" className="mt-6">
          <Icon name="home" className="h-5 w-5" />
          {t('notFound.home')}
        </Button>
      </div>
    </div>
  )
}

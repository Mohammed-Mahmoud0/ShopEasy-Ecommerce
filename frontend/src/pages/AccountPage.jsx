import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { useLanguage } from '../context/language'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/Icon'

export function AccountPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const name = user?.name || 'Customer'
  const isAdmin = user?.role === 'ADMIN'

  const signOut = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">ShopEasy / Account</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-app">{t('account.title')}</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl app-surface p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--accent-soft)] text-2xl font-bold text-[var(--accent)]">{name[0].toUpperCase()}</span>
              <div>
                <p className="text-xs text-muted">{t('account.signedInAs')}</p>
                <h2 className="text-xl font-bold text-app">{name}</h2>
                {isAdmin && <Badge tone="brand" className="mt-2">Admin</Badge>}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}><Icon name="logout" className="h-4 w-4" />{t('account.signOut')}</Button>
          </div>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--bg-soft)] p-5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{t('account.email')}</dt>
              <dd className="mt-2 break-all text-sm font-semibold text-app">{user?.email}</dd>
            </div>
            <div className="rounded-2xl bg-[var(--bg-soft)] p-5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Role</dt>
              <dd className="mt-2 text-sm font-semibold text-app">{isAdmin ? 'Administrator' : 'Customer'}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-3xl app-panel p-7">
          <h2 className="text-lg font-semibold text-app">{t('account.quickLinks')}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{t('account.quickLinksBody')}</p>
          <div className="mt-6 grid gap-3">
            <Button as={Link} to="/orders" variant="outline" fullWidth><Icon name="package" className="h-4 w-4" />{t('nav.orders')}</Button>
            <Button as={Link} to="/wishlist" variant="outline" fullWidth><Icon name="heart" className="h-4 w-4" />{t('nav.wishlist')}</Button>
            {isAdmin && <Button as={Link} to="/admin" fullWidth><Icon name="grid" className="h-4 w-4" />{t('admin.title')}</Button>}
          </div>
        </section>
      </div>
    </div>
  )
}

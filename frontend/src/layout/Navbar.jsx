import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { useCart } from '../context/cart'
import { useLanguage } from '../context/language'
import { Icon } from '../components/Icon'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'

export function Navbar() {
  const { t } = useLanguage()
  const { count, openDrawer } = useCart()
  const { isAuthenticated, user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()

  const links = [
    { to: '/', label: t('nav.home'), end: true, icon: 'home' },
    { to: '/shop', label: t('nav.shop'), icon: 'grid' },
    { to: '/wishlist', label: t('nav.wishlist'), icon: 'heart' },
    { to: '/orders', label: t('nav.orders'), icon: 'package' },
    ...(isAdmin ? [{ to: '/admin', label: t('admin.title'), icon: 'grid' }] : []),
  ]

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'app-button-dark'
        : 'text-muted hover:bg-[var(--bg-soft)] hover:text-app'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="app-focus flex min-w-0 items-center gap-3"
          onClick={() => navigate('/')}
          type="button"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-lg [background:linear-gradient(135deg,#315ed4,#087f85)]">
            <Icon name="bag" className="h-5 w-5" />
          </span>
          <span className="min-w-0 text-start">
            <span className="block text-base font-semibold text-app">
              {t('brand.name')}
            </span>
            <span className="block truncate text-xs text-muted">
              {t('brand.tagline')}
            </span>
          </span>
        </button>

        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <LanguageToggle />
          <ThemeToggle />

          <NavLink
            to="/account"
            className="app-panel app-focus hidden h-10 w-10 place-items-center rounded-lg text-muted transition hover:text-[var(--brand)] sm:grid"
            title={isAuthenticated ? t('nav.account') : t('nav.signIn')}
          >
            <Icon name="user" className="h-5 w-5" />
          </NavLink>

          <button
            className="app-panel app-focus relative grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted transition hover:text-[var(--brand)]"
            onClick={openDrawer}
            title={t('nav.cart')}
            type="button"
          >
            <Icon name="bag" className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -end-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile tab bar */}
      <nav className={`grid ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'} border-t border-[var(--line)] md:hidden`}>
        {[...links, { to: '/account', label: t('nav.account'), icon: 'user' }].map(
          (link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-xs font-medium transition ${
                  isActive ? 'text-[var(--brand)]' : 'text-muted'
                }`
              }
            >
              <Icon name={link.icon} className="h-5 w-5" />
              {link.label}
            </NavLink>
          ),
        )}
      </nav>
    </header>
  )
}

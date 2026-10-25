import { Link } from 'react-router-dom'
import { useLanguage } from '../context/language'
import { Icon } from '../components/Icon'

export function Footer() {
  const { t } = useLanguage()

  const columns = [
    {
      title: t('nav.shop'),
      links: [
        { label: t('nav.home'), to: '/' },
        { label: t('nav.shop'), to: '/shop' },
        { label: t('nav.wishlist'), to: '/wishlist' },
      ],
    },
    {
      title: t('nav.account'),
      links: [
        { label: t('nav.account'), to: '/account' },
        { label: t('nav.orders'), to: '/orders' },
        { label: t('cart.title'), to: '/cart' },
      ],
    },
  ]

  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--bg-elevated)_60%,var(--bg))]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl text-white [background:linear-gradient(135deg,var(--brand),var(--accent))]">
              <Icon name="bag" className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-app">
              {t('brand.name')}
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
            {t('footer.tagline')}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-app">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition hover:text-[var(--brand)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--line)] py-5">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-muted sm:px-6 lg:px-8">
          © {t('brand.name')}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}

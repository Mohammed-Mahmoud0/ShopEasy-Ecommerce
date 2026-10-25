import { Link } from 'react-router-dom'
import { useLanguage } from '../context/language'
import { useProducts, useCollections } from '../api/queries'
import { ProductGrid } from '../components/product/ProductGrid'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/Icon'
import heroEditorial from '../assets/hero-editorial.png'

function Perk({ icon, title, body }) {
  return (
    <div className="rounded-2xl app-panel p-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_13%,transparent)] text-[var(--brand)]">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-app">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted">{body}</p>
    </div>
  )
}

export function HomePage() {
  const { t, pick } = useLanguage()
  const { data: collections = [] } = useCollections()
  const { data, isLoading } = useProducts({ page: 1, page_size: 8 })

  const products = data?.results || []
  const productCount = data?.count || 0

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">
              <Icon name="spark" className="h-3.5 w-3.5" />
              {t('home.heroBadge')}
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-app sm:text-5xl lg:text-6xl">
              {t('home.heroTitle')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
              {t('home.heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/shop" size="lg">
                {t('home.heroShop')}
                <Icon name="arrowRight" className="h-5 w-5 rtl:-scale-x-100" />
              </Button>
              <Button as={Link} to="/shop" variant="outline" size="lg">
                {t('home.heroBrowse')}
              </Button>
            </div>

            <div className="mt-10 grid max-w-sm grid-cols-2 gap-4 border-t border-[var(--line)] pt-5">
              {[
                { label: t('home.statProducts'), value: productCount || '—' },
                { label: t('home.statCollections'), value: collections.length || '—' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-app">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--brand)_35%,transparent),transparent_60%),radial-gradient(circle_at_80%_80%,color-mix(in_srgb,var(--accent)_30%,transparent),transparent_55%)] blur-2xl" />
            <div className="relative aspect-square overflow-hidden rounded-[2rem] app-surface p-2">
              <img src={heroEditorial} alt={t('home.heroImageAlt')} className="h-full w-full rounded-[1.6rem] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Perk
            icon="spark"
            title={t('home.perkFreshTitle')}
            body={t('home.perkFreshBody')}
          />
          <Perk
            icon="truck"
            title={t('home.perkFastTitle')}
            body={t('home.perkFastBody')}
          />
          <Perk
            icon="shield"
            title={t('home.perkSecureTitle')}
            body={t('home.perkSecureBody')}
          />
        </div>
      </section>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-app">
            {t('home.featuredCollections')}
          </h2>
          <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/shop?collection=${collection.id}`}
                className="group relative flex h-28 w-48 shrink-0 flex-col justify-end overflow-hidden rounded-2xl app-panel p-4 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand)_16%,transparent),transparent_70%)] transition group-hover:opacity-80" />
                <Icon
                  name="tag"
                  className="absolute end-4 top-4 h-6 w-6 text-[var(--brand)] opacity-70"
                />
                <span className="relative text-sm font-semibold text-app">
                  {pick(collection, 'title')}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-app">
            {t('home.featuredProducts')}
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] transition hover:gap-2"
          >
            {t('common.viewAll')}
            <Icon name="arrowRight" className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
        <ProductGrid products={products} isLoading={isLoading} skeletonCount={8} />
      </section>
    </div>
  )
}

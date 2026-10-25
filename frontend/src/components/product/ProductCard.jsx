import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/language'
import { formatMoney } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/media'
import { Icon } from '../Icon'
import { Badge } from '../ui/Badge'

export function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  isBusy = false,
}) {
  const { lang, t, pick } = useLanguage()
  const image = product.images?.[0]?.image
  const [imageFailed, setImageFailed] = useState(false)
  const isAvailable = product.is_available ?? product.inventory > 0
  const lowStock = isAvailable && product.inventory > 0 && product.inventory <= 5

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl app-panel shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-soft)]">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          {image && !imageFailed ? (
            <img
              alt={pick(product, 'title')}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={resolveMediaUrl(image)}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="grid h-full place-items-center bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand)_20%,var(--bg-soft)),var(--bg-soft)_52%,color-mix(in_srgb,var(--gold)_28%,var(--bg-soft)))]">
              <div className="grid h-20 w-20 place-items-center rounded-2xl border border-white/30 bg-white/40 text-[var(--brand)] shadow-sm backdrop-blur dark:bg-black/10">
                <Icon name="box" className="h-9 w-9" />
              </div>
            </div>
          )}
        </Link>

        <div className="absolute start-3 top-3 flex flex-col gap-1.5">
          {!isAvailable && <Badge tone="danger">{t('product.soldOut')}</Badge>}
          {lowStock && (
            <Badge tone="warning">
              {t('product.lowStock', { n: product.inventory })}
            </Badge>
          )}
        </div>

        <button
          className={`absolute end-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border shadow-sm transition disabled:opacity-60 ${
            isWishlisted
              ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15'
              : 'border-white/70 bg-white/85 text-slate-600 hover:text-rose-600 dark:border-white/10 dark:bg-black/35 dark:text-white'
          }`}
          onClick={() => onToggleWishlist(product)}
          disabled={isBusy}
          title={t('nav.wishlist')}
          type="button"
        >
          <Icon name="heart" className="h-4 w-4" filled={isWishlisted} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/product/${product.id}`}>
          <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-app transition group-hover:text-[var(--brand)]">
            {pick(product, 'title')}
          </h2>
        </Link>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted">
          {pick(product, 'description') || t('product.noDescription')}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-app">
              {formatMoney(product.unit_price, lang)}
            </p>
          </div>
          <button
            className="app-button-primary app-focus inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isAvailable}
            onClick={() => onAddToCart(product, 1)}
            title={t('product.addToCart')}
            type="button"
          >
            <Icon name="plus" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  )
}

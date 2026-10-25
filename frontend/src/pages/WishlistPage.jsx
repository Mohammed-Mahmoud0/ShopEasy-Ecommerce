import { Link } from 'react-router-dom'
import { useLanguage } from '../context/language'
import { useWishlist } from '../api/queries'
import { useProductActions } from '../hooks/useProductActions'
import { formatMoney } from '../utils/format'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Icon } from '../components/Icon'

export function WishlistPage() {
  const { lang, t, pick } = useLanguage()
  const { data: wishlist = [], isLoading } = useWishlist()
  const { addToCart, toggleWishlist } = useProductActions()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-app">
        {t('wishlist.title')}
      </h1>
      <p className="mt-2 text-sm text-muted">{t('wishlist.localNote')}</p>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <EmptyState
            icon="heart"
            title={t('wishlist.empty')}
            description={t('wishlist.emptyHint')}
            action={
              <Button as={Link} to="/shop">
                {t('cart.continueShopping')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {wishlist.map((item) => {
              const product = item.product || {}
              const available = product.is_available
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl app-panel p-4"
                >
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--bg-soft)] text-[var(--brand)]">
                    <Icon name="box" className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/product/${product.id}`}
                      className="line-clamp-1 text-sm font-semibold text-app transition hover:text-[var(--brand)]"
                    >
                      {pick(product, 'title')}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-app">
                        {formatMoney(product.unit_price, lang)}
                      </span>
                      {available ? (
                        <Badge tone="success">{t('product.available')}</Badge>
                      ) : (
                        <Badge tone="danger">{t('product.soldOut')}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      disabled={!available}
                      onClick={() => addToCart(product, 1)}
                    >
                      <Icon name="plus" className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {t('product.addToCart')}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-rose-500"
                      onClick={() => toggleWishlist(product)}
                      title={t('common.remove')}
                    >
                      <Icon name="heart" className="h-5 w-5" filled />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

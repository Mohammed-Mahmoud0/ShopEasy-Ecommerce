import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/cart'
import { useLanguage } from '../context/language'
import { useToast } from '../context/toast'
import { formatMoney } from '../utils/format'
import { CartLineItem } from '../components/cart/CartLineItem'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/Icon'

export function CartPage() {
  const { lang, t } = useLanguage()
  const toast = useToast()
  const navigate = useNavigate()
  const { items, total, count, updateItem, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon="bag"
          title={t('cart.empty')}
          description={t('cart.emptyHint')}
          action={
            <Button as={Link} to="/shop">
              {t('cart.continueShopping')}
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-app">
        {t('cart.title')}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="divide-y divide-[var(--line)] rounded-2xl app-panel px-5">
          {items.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onRemove={removeItem}
              onError={(message) => toast.error(message)}
            />
          ))}
        </div>

        <aside className="h-fit rounded-2xl app-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-app">
            {t('checkout.orderSummary')}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">
                {t('checkout.items')} ({count})
              </dt>
              <dd className="font-medium text-app">{formatMoney(total, lang)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
              <dt className="text-base font-semibold text-app">
                {t('cart.total')}
              </dt>
              <dd className="text-xl font-bold text-app">
                {formatMoney(total, lang)}
              </dd>
            </div>
          </dl>

          <Button
            size="lg"
            fullWidth
            className="mt-6"
            onClick={() => navigate('/checkout')}
          >
            {t('cart.checkout')}
            <Icon name="arrowRight" className="h-5 w-5 rtl:-scale-x-100" />
          </Button>
          <Button
            as={Link}
            to="/shop"
            variant="ghost"
            fullWidth
            className="mt-2"
          >
            {t('cart.continueShopping')}
          </Button>
        </aside>
      </div>
    </div>
  )
}

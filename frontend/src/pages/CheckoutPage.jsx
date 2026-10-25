import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/cart'
import { useAuth } from '../context/auth'
import { useLanguage } from '../context/language'
import { useToast } from '../context/toast'
import { useCreateOrder } from '../api/queries'
import { formatMoney, errorMessage } from '../utils/format'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/Icon'

export function CheckoutPage() {
  const { lang, t } = useLanguage()
  const toast = useToast()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { items, total, count, clearCart } = useCart()
  const createOrder = useCreateOrder()

  if (!isAuthenticated) {
    return <div className="mx-auto max-w-2xl px-4 py-16"><EmptyState
      icon="shield" title={t('checkout.signInRequired')}
      action={<Button as={Link} to="/login" state={{ from: '/checkout' }}>{t('auth.signIn')}</Button>}
    /></div>
  }
  if (items.length === 0) {
    return <div className="mx-auto max-w-2xl px-4 py-16"><EmptyState
      icon="bag" title={t('cart.empty')} description={t('cart.emptyHint')}
      action={<Button as={Link} to="/shop">{t('cart.continueShopping')}</Button>}
    /></div>
  }

  const placeOrder = async () => {
    try {
      const order = await createOrder.mutateAsync()
      clearCart()
      toast.success(t('checkout.success'))
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">ShopEasy / Checkout</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-app">{t('checkout.title')}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="rounded-3xl app-panel p-6 sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Icon name="shield" className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-app">{t('checkout.reviewTitle')}</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-muted">{t('checkout.reviewBody')}</p>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--bg-soft)] p-5 text-sm leading-6 text-muted">
            {t('checkout.noPayment')}
          </div>
        </div>
        <aside className="h-fit rounded-3xl app-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-app">{t('checkout.orderSummary')}</h2>
          <ul className="mt-5 divide-y divide-[var(--line)]">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                <span className="text-muted">{item.quantity} × {item.product?.title}</span>
                <span className="shrink-0 font-semibold text-app">{formatMoney(item.total_price, lang)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-5">
            <span className="font-semibold text-app">{t('cart.total')} ({count})</span>
            <span className="text-2xl font-bold text-app">{formatMoney(total, lang)}</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">{t('checkout.totalNote')}</p>
          <Button size="lg" fullWidth className="mt-6" onClick={placeOrder} disabled={createOrder.isPending}>
            <Icon name="check" className="h-5 w-5" />
            {createOrder.isPending ? t('checkout.placing') : t('checkout.placeOrder')}
          </Button>
        </aside>
      </div>
    </div>
  )
}

import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../context/language'
import { useToast } from '../context/toast'
import { useOrder, useCancelOrder } from '../api/queries'
import { statusTone, orderTotal, orderItemCount } from '../utils/orders'
import { formatMoney, formatDateTime, errorMessage } from '../utils/format'
import { OrderTimeline } from '../components/order/OrderTimeline'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Icon } from '../components/Icon'

export function OrderDetailPage() {
  const { id } = useParams()
  const { lang, t } = useLanguage()
  const toast = useToast()
  const { data: order, isLoading, error } = useOrder(id)
  const cancelOrder = useCancelOrder()
  const cancel = async () => {
    if (!window.confirm(t('orders.cancelConfirm'))) return
    try { await cancelOrder.mutateAsync(id); toast.success(t('orders.cancelled')) }
    catch (failure) { toast.error(errorMessage(failure)) }
  }
  if (isLoading) return <div className="mx-auto max-w-3xl space-y-4 px-4 py-10"><Skeleton className="h-10 rounded-xl" /><Skeleton className="h-40 rounded-2xl" /></div>
  if (!order) return <div className="mx-auto max-w-2xl px-4 py-16"><EmptyState icon="alert" title={t('common.somethingWrong')} description={errorMessage(error)} action={<Button as={Link} to="/orders">{t('orders.title')}</Button>} /></div>
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-[var(--brand)]"><Icon name="arrowLeft" className="h-4 w-4 rtl:-scale-x-100" />{t('orders.title')}</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-3xl font-bold tracking-tight text-app">{t('orders.detailTitle', { id: order.id.slice(0, 8).toUpperCase() })}</h1><p className="mt-2 text-sm text-muted">{t('orders.placedOn', { date: formatDateTime(order.placed_at, lang) })}</p></div>
        <Badge tone={statusTone(order.status)}>{t(`status.${order.status}`)}</Badge>
      </div>
      {order.status === 'PLACED' && <Button variant="outline" className="mt-5" onClick={cancel} disabled={cancelOrder.isPending}>{t('orders.cancel')}</Button>}
      <div className="mt-7 rounded-2xl app-surface p-6"><OrderTimeline status={order.status} /></div>
      <div className="mt-6 rounded-2xl app-panel p-6">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-app">{t('checkout.items')}</h2><span className="text-sm text-muted">{t('orders.items', { n: orderItemCount(order) })}</span></div>
        <ul className="mt-4 divide-y divide-[var(--line)]">{order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--bg-soft)] text-[var(--brand)]"><Icon name="box" className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1"><Link to={`/product/${item.product.id}`} className="line-clamp-1 text-sm font-semibold text-app hover:text-[var(--brand)]">{item.product.title}</Link><p className="text-xs text-muted">{item.quantity} × {formatMoney(item.unit_price, lang)}</p></div>
            <span className="text-sm font-semibold text-app">{formatMoney(item.total_price, lang)}</span>
          </li>
        ))}</ul>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4"><span className="font-semibold text-app">{t('orders.total')}</span><span className="text-xl font-bold text-app">{formatMoney(orderTotal(order), lang)}</span></div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/language'
import { useOrders } from '../api/queries'
import { statusTone, orderTotal, orderItemCount } from '../utils/orders'
import { formatMoney, formatDateTime, errorMessage } from '../utils/format'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Pagination } from '../components/ui/Pagination'
import { Icon } from '../components/Icon'

export function OrdersPage() {
  const { lang, t } = useLanguage()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useOrders(page)
  const orders = data?.results || []
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">ShopEasy / Orders</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-app">{t('orders.title')}</h1>
      <div className="mt-8">
        {isLoading ? <div className="space-y-3">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-28 rounded-2xl" />)}</div>
          : isError ? <EmptyState icon="alert" title={t('common.somethingWrong')} description={errorMessage(error)} />
            : orders.length === 0 ? <EmptyState icon="package" title={t('orders.empty')} action={<Button as={Link} to="/shop">{t('cart.continueShopping')}</Button>} />
              : <div className="space-y-4">{orders.map((order) => (
                <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-2xl app-panel p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><p className="text-base font-semibold text-app">{t('orders.order', { id: order.id.slice(0, 8).toUpperCase() })}</p><p className="mt-1 text-xs text-muted">{t('orders.placedOn', { date: formatDateTime(order.placed_at, lang) })}</p></div>
                    <Badge tone={statusTone(order.status)}>{t(`status.${order.status}`)}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
                    <span className="text-sm text-muted">{t('orders.items', { n: orderItemCount(order) })}</span>
                    <span className="flex items-center gap-3 font-bold text-app">{formatMoney(orderTotal(order), lang)}<Icon name="chevronRight" className="h-5 w-5 text-muted rtl:-scale-x-100" /></span>
                  </div>
                </Link>
              ))}</div>}
        {!isLoading && !isError && <Pagination currentPage={page} totalItems={data?.count || 0} pageSize={10} onPageChange={setPage} />}
      </div>
    </div>
  )
}

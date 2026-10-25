import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useAuth } from '../context/auth'
import { useToast } from '../context/toast'
import { useLanguage } from '../context/language'
import { errorMessage, formatMoney, formatDateTime } from '../utils/format'
import { statusTone } from '../utils/orders'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Pagination } from '../components/ui/Pagination'
import { Icon } from '../components/Icon'

const EMPTY = {
  name: '', description: '', brand: '', category: '', price: '',
  stockQuantity: 0, active: true,
}

function ProductForm({ product, onSaved, onCancel }) {
  const { token } = useAuth()
  const toast = useToast()
  const { t } = useLanguage()
  const [form, setForm] = useState(product ? {
    name: product.name, description: product.description, brand: product.brand,
    category: product.category, price: product.price,
    stockQuantity: product.stockQuantity, active: product.active,
  } : EMPTY)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const save = async (event) => {
    event.preventDefault()
    if (file && file.size > 2_000_000) {
      toast.error(t('admin.imageTooLarge'))
      return
    }
    setBusy(true)
    let saved
    try {
      saved = await api.saveProduct(token, {
        ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity),
      }, product?.id)
      if (file) await api.uploadProductImage(token, saved.id, file)
      toast.success(t('admin.saved'))
      onSaved()
    } catch (error) {
      toast.error(saved ? `${t('admin.imageFailed')} ${errorMessage(error)}` : errorMessage(error))
      if (saved) onSaved()
    }
    finally { setBusy(false) }
  }

  return (
    <form onSubmit={save} className="rounded-3xl app-surface p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-app">{product ? t('admin.editProduct') : t('admin.newProduct')}</h2>
        <button type="button" onClick={onCancel} aria-label={t('common.close')} className="text-muted hover:text-app"><Icon name="x" className="h-5 w-5" /></button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label={t('admin.name')} value={form.name} onChange={(v) => update('name', v)} required maxLength={150} />
        <Field label={t('admin.brand')} value={form.brand} onChange={(v) => update('brand', v)} required maxLength={100} />
        <Field label={t('admin.category')} value={form.category} onChange={(v) => update('category', v)} required maxLength={100} />
        <Field label={t('admin.price')} type="number" min="0.01" step="0.01" value={form.price} onChange={(v) => update('price', v)} required />
        <Field label={t('admin.stock')} type="number" min="0" max="1000000" step="1" value={form.stockQuantity} onChange={(v) => update('stockQuantity', v)} required />
        <label className="block text-sm text-muted">{t('admin.image')}<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block w-full text-xs" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
      </div>
      <label className="mt-4 block text-sm text-muted">{t('admin.description')}
        <textarea className="app-input mt-2 min-h-28 resize-y px-3 py-2" value={form.description} onChange={(event) => update('description', event.target.value)} required maxLength={2000} />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm text-app"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} />{t('admin.active')}</label>
      <div className="mt-6 flex gap-3"><Button type="submit" disabled={busy}>{busy ? t('common.saving') : t('common.save')}</Button><Button variant="outline" onClick={onCancel}>{t('common.cancel')}</Button></div>
    </form>
  )
}

function Field({ label, onChange, ...props }) {
  return <label className="block text-sm text-muted">{label}<input className="app-input mt-2 px-3" onChange={(event) => onChange(event.target.value)} {...props} /></label>
}

function ProductsAdmin() {
  const { token } = useAuth()
  const toast = useToast()
  const { t, lang } = useLanguage()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState(undefined)
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => api.getAdminProducts(token, page),
  })
  const refresh = () => {
    setEditing(undefined)
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['collections'] })
  }
  const deactivate = async (product) => {
    if (!window.confirm(t('admin.deactivateConfirm'))) return
    try { await api.deactivateProduct(token, product.id); toast.success(t('admin.deactivated')); refresh() }
    catch (failure) { toast.error(errorMessage(failure)) }
  }
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold text-app">{t('admin.products')}</h2><p className="mt-1 text-sm text-muted">{t('admin.productsHint')}</p></div><Button onClick={() => setEditing(null)}><Icon name="plus" className="h-4 w-4" />{t('admin.newProduct')}</Button></div>
      {editing !== undefined && <ProductForm key={editing?.id || 'new'} product={editing} onSaved={refresh} onCancel={() => setEditing(undefined)} />}
      {error && <p className="text-sm text-rose-600">{errorMessage(error)}</p>}
      <div className="grid gap-3">
        {isLoading ? <p className="text-sm text-muted">{t('common.loading')}</p> : data?.content?.map((product) => (
          <article key={product.id} className="flex flex-wrap items-center gap-4 rounded-2xl app-panel p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--bg-soft)] text-[var(--brand)]"><Icon name="box" className="h-6 w-6" /></div>
            <div className="min-w-0 flex-1"><Link to={`/product/${product.id}`} className="font-semibold text-app hover:text-[var(--brand)]">{product.name}</Link><p className="mt-1 text-xs text-muted">{product.category} · {formatMoney(product.price, lang)} · {t('admin.stock')}: {product.stockQuantity}</p></div>
            <Badge tone={product.active ? 'success' : 'neutral'}>{product.active ? t('admin.active') : t('admin.inactive')}</Badge>
            <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(product)}>{t('admin.edit')}</Button>{product.active && <Button size="sm" variant="danger" onClick={() => deactivate(product)}>{t('admin.deactivate')}</Button>}</div>
          </article>
        ))}
        {!isLoading && data?.content?.length === 0 && <p className="rounded-2xl app-panel p-6 text-sm text-muted">{t('admin.noProducts')}</p>}
      </div>
      <Pagination currentPage={page + 1} totalItems={data?.totalElements || 0} pageSize={20} onPageChange={(next) => setPage(next - 1)} />
    </section>
  )
}

function OrdersAdmin() {
  const { token } = useAuth()
  const { t, lang } = useLanguage()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => api.getAdminOrders(token, page),
  })
  const changeStatus = async (order, status) => {
    try {
      await api.setOrderStatus(token, order.id, status)
      toast.success(t('admin.statusSaved'))
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch (failure) { toast.error(errorMessage(failure)) }
  }
  return (
    <section className="space-y-5">
      <div><h2 className="text-2xl font-bold text-app">{t('admin.orders')}</h2><p className="mt-1 text-sm text-muted">{t('admin.ordersHint')}</p></div>
      {error && <p className="text-sm text-rose-600">{errorMessage(error)}</p>}
      <div className="grid gap-3">
        {isLoading ? <p className="text-sm text-muted">{t('common.loading')}</p> : data?.content?.map((order) => (
          <article key={order.id} className="rounded-2xl app-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-semibold text-app">{order.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-xs text-muted">{formatDateTime(order.createdAt, lang)} · {order.items.length} {t('checkout.items')}</p></div>
              <Badge tone={statusTone(order.status)}>{t(`status.${order.status}`)}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4"><strong className="text-app">{formatMoney(order.total, lang)}</strong>
              <div className="flex flex-wrap gap-2">
                {order.status === 'PLACED' && <><Button size="sm" onClick={() => changeStatus(order, 'SHIPPED')}>{t('admin.markShipped')}</Button><Button size="sm" variant="outline" onClick={() => changeStatus(order, 'CANCELLED')}>{t('orders.cancel')}</Button></>}
                {order.status === 'SHIPPED' && <Button size="sm" onClick={() => changeStatus(order, 'DELIVERED')}>{t('admin.markDelivered')}</Button>}
              </div>
            </div>
          </article>
        ))}
        {!isLoading && data?.content?.length === 0 && <p className="rounded-2xl app-panel p-6 text-sm text-muted">{t('admin.noOrders')}</p>}
      </div>
      <Pagination currentPage={page + 1} totalItems={data?.totalElements || 0} pageSize={20} onPageChange={(next) => setPage(next - 1)} />
    </section>
  )
}

export function AdminPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [tab, setTab] = useState('products')
  if (user?.role !== 'ADMIN') return <div className="mx-auto max-w-3xl px-4 py-16"><p className="rounded-2xl app-panel p-8 text-center text-muted">{t('admin.forbidden')}</p></div>
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">ShopEasy / Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-app">{t('admin.title')}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{t('admin.subtitle')}</p>
      <div className="mt-8 flex gap-2 border-b border-[var(--line)] pb-3">
        {['products', 'orders'].map((item) => <button key={item} type="button" className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${tab === item ? 'app-button-primary' : 'text-muted hover:bg-[var(--bg-soft)]'}`} onClick={() => setTab(item)}>{t(`admin.${item}`)}</button>)}
      </div>
      <div className="mt-7">{tab === 'products' ? <ProductsAdmin /> : <OrdersAdmin />}</div>
    </div>
  )
}

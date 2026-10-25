import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../context/language'
import { useProduct } from '../api/queries'
import { useProductActions } from '../hooks/useProductActions'
import { formatMoney, errorMessage } from '../utils/format'
import { resolveMediaUrl } from '../utils/media'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { QtyStepper } from '../components/ui/QtyStepper'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/Icon'

export function ProductPage() {
  const { id } = useParams()
  const { lang, t, pick } = useLanguage()
  const [quantity, setQuantity] = useState(1)
  const [imageFailed, setImageFailed] = useState(false)
  const { data: product, isLoading, error } = useProduct(id)
  const { addToCart, toggleWishlist, isWishlisted } = useProductActions()

  if (isLoading) return <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2"><Skeleton className="aspect-square rounded-3xl" /><Skeleton className="h-80 rounded-3xl" /></div>
  if (!product) return <div className="mx-auto max-w-2xl px-4 py-16"><EmptyState icon="alert" title={t('product.notFound')} description={error && errorMessage(error)} action={<Button as={Link} to="/shop">{t('common.backToShop')}</Button>} /></div>

  const image = product.images?.[0]?.image
  const available = product.is_available
  return (
    <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 lg:px-8">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-[var(--brand)]"><Icon name="arrowLeft" className="h-4 w-4 rtl:-scale-x-100" />{t('common.backToShop')}</Link>
      <div className="mt-7 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] app-panel">
          <div className="absolute inset-0 grid place-items-center bg-[var(--bg-soft)] text-[var(--brand)]"><Icon name="box" className="h-24 w-24 opacity-50" /></div>
          {image && !imageFailed && <img src={resolveMediaUrl(image)} alt={pick(product, 'title')} className="relative h-full w-full object-cover" onError={() => setImageFailed(true)} />}
        </div>
        <div className="self-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">{product.category || t('nav.shop')}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-app sm:text-5xl">{pick(product, 'title')}</h1>
          <p className="mt-3 text-sm text-muted">{product.brand}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-app">{formatMoney(product.unit_price, lang)}</span>
            <Badge tone={available ? 'success' : 'danger'}>{available ? t('product.available') : t('product.soldOut')}</Badge>
          </div>
          <p className="mt-6 text-base leading-8 text-muted">{pick(product, 'description') || t('product.noDescription')}</p>
          {available && <p className="mt-5 text-sm text-muted">{t('product.stock', { n: product.inventory })}</p>}
          <div className="mt-8 flex flex-wrap items-end gap-3">
            <div><span className="mb-2 block text-xs font-semibold text-muted">{t('product.quantity')}</span><QtyStepper value={quantity} onChange={setQuantity} max={Math.min(1000, Math.max(1, product.inventory))} /></div>
            <Button size="lg" className="flex-1" disabled={!available} onClick={() => addToCart(product, quantity)}><Icon name="bag" className="h-5 w-5" />{t('product.addToCart')}</Button>
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => toggleWishlist(product)} title={t('nav.wishlist')}><Icon name="heart" className="h-5 w-5" filled={isWishlisted(product)} /></Button>
          </div>
          <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] p-4 text-sm leading-6 text-muted">{t('product.stockNote')}</div>
        </div>
      </div>
    </div>
  )
}

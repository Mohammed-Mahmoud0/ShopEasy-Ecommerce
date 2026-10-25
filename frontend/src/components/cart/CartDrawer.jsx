import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/cart'
import { useLanguage } from '../../context/language'
import { useToast } from '../../context/toast'
import { formatMoney } from '../../utils/format'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Icon } from '../Icon'
import { CartLineItem } from './CartLineItem'

export function CartDrawer() {
  const { lang, t } = useLanguage()
  const toast = useToast()
  const navigate = useNavigate()
  const {
    items,
    total,
    count,
    isDrawerOpen,
    closeDrawer,
    updateItem,
    removeItem,
  } = useCart()

  useEffect(() => {
    if (!isDrawerOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen, closeDrawer])

  if (!isDrawerOpen) return null

  const goTo = (path) => {
    closeDrawer()
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_150ms_ease]"
        onClick={closeDrawer}
      />
      <aside className="drawer-enter absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-[var(--bg-elevated)] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Icon name="bag" className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="text-lg font-semibold text-app">{t('cart.title')}</h2>
            {count > 0 && (
              <span className="rounded-full bg-[var(--bg-soft)] px-2 py-0.5 text-xs font-semibold text-muted">
                {count}
              </span>
            )}
          </div>
          <button
            className="app-focus grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-[var(--bg-soft)] hover:text-app"
            onClick={closeDrawer}
            type="button"
            aria-label={t('common.close')}
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon="bag"
              title={t('cart.empty')}
              description={t('cart.emptyHint')}
              action={
                <Button onClick={() => goTo('/shop')}>
                  {t('cart.continueShopping')}
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-[var(--line)] overflow-y-auto px-5">
              {items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  onError={(message) => toast.error(message)}
                  compact
                />
              ))}
            </div>

            <footer className="border-t border-[var(--line)] p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{t('cart.subtotal')}</span>
                <span className="text-lg font-bold text-app">
                  {formatMoney(total, lang)}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                <Button size="lg" fullWidth onClick={() => goTo('/checkout')}>
                  {t('cart.checkout')}
                  <Icon name="arrowRight" className="h-4 w-4 rtl:hidden" />
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => goTo('/cart')}
                >
                  {t('cart.viewCart')}
                </Button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

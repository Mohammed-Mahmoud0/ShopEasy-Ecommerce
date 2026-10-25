import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/language'
import { formatMoney, errorMessage } from '../../utils/format'
import { QtyStepper } from '../ui/QtyStepper'
import { Icon } from '../Icon'

export function CartLineItem({ item, onUpdate, onRemove, onError, compact = false }) {
  const { lang, pick } = useLanguage()
  const product = item.product || {}
  const lineTotal = Number(item.total_price ?? product.unit_price * item.quantity)

  const handleUpdate = async (quantity) => {
    try {
      await onUpdate(item.id, quantity)
    } catch (error) {
      onError?.(errorMessage(error))
    }
  }

  const handleRemove = async () => {
    try {
      await onRemove(item.id)
    } catch (error) {
      onError?.(errorMessage(error))
    }
  }

  return (
    <div className="flex gap-3 py-4">
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[var(--bg-soft)] text-[var(--brand)]">
        <Icon name="box" className="h-7 w-7" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/product/${product.id}`}
            className="line-clamp-2 text-sm font-semibold text-app transition hover:text-[var(--brand)]"
          >
            {pick(product, 'title')}
          </Link>
          <button
            className="app-focus -m-1 shrink-0 rounded p-1 text-muted transition hover:text-rose-500"
            onClick={handleRemove}
            type="button"
            aria-label="Remove item"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-0.5 text-xs text-muted">
          {formatMoney(product.unit_price, lang)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <QtyStepper
            value={item.quantity}
            onChange={handleUpdate}
            size={compact ? 'sm' : 'md'}
          />
          <span className="text-sm font-semibold text-app">
            {formatMoney(lineTotal, lang)}
          </span>
        </div>
      </div>
    </div>
  )
}

import { useLanguage } from '../../context/language'
import { ORDER_FLOW, statusStepIndex } from '../../utils/orders'
import { Icon } from '../Icon'

const icons = { PLACED: 'check', SHIPPED: 'truck', DELIVERED: 'home' }

export function OrderTimeline({ status }) {
  const { t } = useLanguage()
  if (status === 'CANCELLED') {
    return <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600"><Icon name="x" className="h-5 w-5" />{t('status.CANCELLED')}</div>
  }
  const current = statusStepIndex(status)
  return (
    <ol className="flex items-start">
      {ORDER_FLOW.map((step, index) => (
        <li key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <span className={`grid h-10 w-10 place-items-center rounded-full border-2 ${index <= current ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-[var(--line)] text-muted'}`}>
              <Icon name={icons[step]} className="h-5 w-5" />
            </span>
            <span className="text-center text-xs font-medium text-muted">{t(`status.${step}`)}</span>
          </div>
          {index < ORDER_FLOW.length - 1 && <span className={`mx-2 mt-5 h-0.5 flex-1 rounded ${index < current ? 'bg-[var(--brand)]' : 'bg-[var(--line)]'}`} />}
        </li>
      ))}
    </ol>
  )
}

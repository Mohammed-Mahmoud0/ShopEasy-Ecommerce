import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/language'
import { useDebounce } from '../../hooks/useDebounce'
import { Icon } from '../Icon'

export function ProductFilters({
  filters,
  collections = [],
  onChange,
  onClear,
  resultCount,
}) {
  const { t, pick } = useLanguage()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 400)

  // Push debounced search up to the URL-synced parent.
  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      onChange({ search: debouncedSearch })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // Keep local input in sync when filters are cleared externally.
  useEffect(() => {
    setSearchInput(filters.search || '')
  }, [filters.search])

  const hasActiveFilters =
    filters.search ||
    filters.collection ||
    filters.ordering ||
    filters.minPrice ||
    filters.maxPrice

  return (
    <div className="app-surface overflow-hidden rounded-2xl">
      {/* Collection chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-[var(--line)] p-4">
        <button
          className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
            !filters.collection
              ? 'app-button-primary'
              : 'app-panel text-muted hover:text-[var(--brand)]'
          }`}
          onClick={() => onChange({ collection: '' })}
          type="button"
        >
          {t('common.all')}
        </button>
        {collections.map((collection) => (
          <button
            key={collection.id}
            className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
              String(filters.collection) === String(collection.id)
                ? 'app-button-primary'
                : 'app-panel text-muted hover:text-[var(--brand)]'
            }`}
            onClick={() => onChange({ collection: collection.id })}
            type="button"
          >
            {pick(collection, 'title')}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_150px_130px_130px_auto]">
        <label className="relative block">
          <span className="sr-only">{t('shop.searchPlaceholder')}</span>
          <Icon
            name="search"
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <input
            className="app-input ps-10 pe-3 text-sm placeholder:text-[var(--ink-muted)]"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('shop.searchPlaceholder')}
            type="search"
            value={searchInput}
          />
        </label>

        <label>
          <span className="sr-only">{t('shop.sort')}</span>
          <select
            className="app-input px-3 text-sm"
            onChange={(event) => onChange({ ordering: event.target.value })}
            value={filters.ordering}
          >
            <option value="">{t('shop.sortFeatured')}</option>
            <option value="unit_price">{t('shop.sortPriceLow')}</option>
            <option value="-unit_price">{t('shop.sortPriceHigh')}</option>
            <option value="-last_update">{t('shop.sortNewest')}</option>
          </select>
        </label>

        <label>
          <span className="sr-only">{t('shop.minPrice')}</span>
          <input
            className="app-input px-3 text-sm"
            min="0"
            onChange={(event) => onChange({ minPrice: event.target.value })}
            placeholder={t('shop.minPrice')}
            type="number"
            value={filters.minPrice}
          />
        </label>

        <label>
          <span className="sr-only">{t('shop.maxPrice')}</span>
          <input
            className="app-input px-3 text-sm"
            min="0"
            onChange={(event) => onChange({ maxPrice: event.target.value })}
            placeholder={t('shop.maxPrice')}
            type="number"
            value={filters.maxPrice}
          />
        </label>

        <button
          className="app-panel app-focus inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-muted transition hover:text-[var(--brand)] disabled:opacity-40"
          onClick={onClear}
          disabled={!hasActiveFilters}
          type="button"
        >
          <Icon name="x" className="h-4 w-4" />
          {t('shop.clearFilters')}
        </button>
      </div>

      {typeof resultCount === 'number' && (
        <div className="border-t border-[var(--line)] px-4 py-2.5 text-xs text-muted">
          {t('shop.resultsCount', { n: resultCount })}
        </div>
      )}
    </div>
  )
}

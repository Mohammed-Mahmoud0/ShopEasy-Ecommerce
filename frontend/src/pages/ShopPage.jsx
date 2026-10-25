import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/language'
import { useProducts, useCollections } from '../api/queries'
import { errorMessage } from '../utils/format'
import { ProductFilters } from '../components/product/ProductFilters'
import { ProductGrid } from '../components/product/ProductGrid'
import { Pagination } from '../components/ui/Pagination'

const PAGE_SIZE = 12

export function ShopPage() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      collection: searchParams.get('collection') || '',
      ordering: searchParams.get('ordering') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    }),
    [searchParams],
  )

  const page = Number(searchParams.get('page') || 1)

  const { data: collections = [] } = useCollections()
  const { data, isLoading, isError, error } = useProducts({
    page,
    page_size: PAGE_SIZE,
    search: filters.search,
    collection_id: filters.collection,
    ordering: filters.ordering,
    unit_price__gt: filters.minPrice,
    unit_price__lt: filters.maxPrice,
  })

  const products = data?.results || []
  const count = data?.count || 0

  const updateFilters = (patch) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    })
    next.delete('page') // reset to page 1 on any filter change
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams(new URLSearchParams())

  const goToPage = (nextPage) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', nextPage)
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-app sm:text-4xl">
          {t('shop.title')}
        </h1>
        <p className="mt-2 text-sm text-muted">{t('shop.subtitle')}</p>
      </div>

      <ProductFilters
        filters={filters}
        collections={collections}
        onChange={updateFilters}
        onClear={clearFilters}
        resultCount={count}
      />

      <div className="mt-8">
        <ProductGrid
          products={products}
          isLoading={isLoading}
          error={isError ? errorMessage(error) : ''}
          skeletonCount={PAGE_SIZE}
          onClearFilters={clearFilters}
        />

        {!isLoading && !isError && products.length > 0 && (
          <Pagination
            currentPage={page}
            totalItems={count}
            pageSize={PAGE_SIZE}
            onPageChange={goToPage}
          />
        )}
      </div>
    </div>
  )
}

import { useLanguage } from '../../context/language'
import { useProductActions } from '../../hooks/useProductActions'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'

export function ProductGrid({
  products = [],
  isLoading = false,
  error = '',
  skeletonCount = 8,
  onClearFilters,
}) {
  const { t } = useLanguage()
  const { addToCart, toggleWishlist, isWishlisted, isTogglingWishlist } =
    useProductActions()

  const gridClass =
    'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6'

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon="alert"
        title={t('common.somethingWrong')}
        description={error}
      />
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon="search"
        title={t('shop.empty')}
        action={
          onClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              {t('shop.clearFilters')}
            </Button>
          )
        }
      />
    )
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={isWishlisted(product)}
          isBusy={isTogglingWishlist}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
        />
      ))}
    </div>
  )
}

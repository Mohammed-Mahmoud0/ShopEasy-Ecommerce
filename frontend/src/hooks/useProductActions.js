import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/cart'
import { useAuth } from '../context/auth'
import { useLanguage } from '../context/language'
import { useToast } from '../context/toast'
import { useWishlist, useToggleWishlist } from '../api/queries'
import { errorMessage } from '../utils/format'

// Shared add-to-cart / wishlist behavior used by cards, product page, wishlist.
export function useProductActions() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addItem, openDrawer } = useCart()
  const { isAuthenticated } = useAuth()
  const { t, pick } = useLanguage()
  const toast = useToast()

  const { data: wishlist = [] } = useWishlist()
  const toggleMutation = useToggleWishlist()

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((item) => item.product?.id).filter(Boolean)),
    [wishlist],
  )

  const isWishlisted = useCallback(
    (product) => wishlistIds.has(product?.id),
    [wishlistIds],
  )

  const addToCart = useCallback(
    async (product, quantity = 1, { open = true } = {}) => {
      if (!isAuthenticated) {
        toast.info(t('checkout.signInRequired'))
        navigate('/login', { state: { from: location.pathname + location.search } })
        return false
      }
      try {
        await addItem(product, quantity)
        if (open) openDrawer()
        toast.success(t('cart.itemAdded'))
        return true
      } catch (error) {
        toast.error(errorMessage(error))
        return false
      }
    },
    [addItem, openDrawer, toast, t, isAuthenticated, navigate, location.pathname, location.search],
  )

  const toggleWishlist = useCallback(
    async (product) => {
      if (!isAuthenticated) {
        toast.info(t('wishlist.signIn'))
        navigate('/login', { state: { from: location.pathname + location.search } })
        return
      }
      const existingItem = wishlist.find((item) => item.product?.id === product.id)
      try {
        await toggleMutation.mutateAsync({ product, existingItem })
      } catch (error) {
        toast.error(errorMessage(error))
      }
    },
    [isAuthenticated, wishlist, toggleMutation, toast, t, navigate, location.pathname, location.search],
  )

  return {
    addToCart,
    toggleWishlist,
    isWishlisted,
    wishlistIds,
    isTogglingWishlist: toggleMutation.isPending,
    pick,
  }
}

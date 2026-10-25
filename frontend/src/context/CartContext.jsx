import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from './auth'
import { CartContext } from './cart'

const EMPTY_CART = { items: [], total_price: 0 }

export function CartProvider({ children }) {
  const { token } = useAuth()
  const [cart, setCart] = useState(EMPTY_CART)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart(EMPTY_CART)
      return EMPTY_CART
    }
    const latest = await api.getCart(token)
    setCart(latest)
    return latest
  }, [token])

  useEffect(() => {
    if (!token) {
      setCart(EMPTY_CART)
      return
    }
    refreshCart().catch(() => setCart(EMPTY_CART))
  }, [token, refreshCart])

  const addItem = useCallback(async (product, quantity = 1) => {
    if (!token) throw new Error('Sign in to add items to your cart.')
    const existing = cart.items.find((item) => item.id === product.id)
    const nextQuantity = (existing?.quantity || 0) + quantity
    const latest = await api.addCartItem(token, { productId: product.id, quantity: nextQuantity })
    setCart(latest)
    return latest
  }, [token, cart.items])

  const updateItem = useCallback(async (productId, quantity) => {
    if (!token) return null
    const latest = await api.updateCartItem(token, productId, quantity)
    setCart(latest)
    return latest
  }, [token])

  const removeItem = useCallback(async (productId) => {
    if (!token) return null
    await api.removeCartItem(token, productId)
    return refreshCart()
  }, [token, refreshCart])

  const clearCart = useCallback(() => setCart(EMPTY_CART), [])
  const items = cart.items
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const total = cart.total_price

  const value = useMemo(() => ({
    cart, items, count, total, isDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    addItem, updateItem, removeItem, clearCart, refreshCart,
  }), [cart, items, count, total, isDrawerOpen, addItem, updateItem, removeItem, clearCart, refreshCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

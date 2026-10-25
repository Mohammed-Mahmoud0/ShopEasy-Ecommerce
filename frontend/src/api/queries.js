import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { useAuth } from '../context/auth'

export const queryKeys = {
  products: (params) => ['products', params],
  product: (id) => ['product', String(id)],
  collections: () => ['collections'],
  orders: (userId, page) => ['orders', userId, page],
  order: (id) => ['order', String(id)],
  wishlist: (userId) => ['wishlist', userId],
}

export function useProducts(params) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => api.getProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}
export function useProduct(id) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => api.getProduct(id),
    enabled: Boolean(id),
  })
}
export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections(),
    queryFn: api.getCollections,
    staleTime: 5 * 60_000,
  })
}

export function useOrders(page = 1) {
  const { token, user } = useAuth()
  return useQuery({
    queryKey: queryKeys.orders(user?.id, page),
    queryFn: () => api.getOrders(token, page),
    enabled: Boolean(token && user),
    placeholderData: keepPreviousData,
  })
}
export function useOrder(id) {
  const { token, user } = useAuth()
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => api.getOrder(token, id),
    enabled: Boolean(token && user && id),
  })
}
export function useCreateOrder() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.createOrder(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
export function useCancelOrder() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.cancelOrder(token, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.order(id) })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useWishlist() {
  const { token, user } = useAuth()
  return useQuery({
    queryKey: queryKeys.wishlist(user?.id),
    queryFn: () => api.getWishlist(token),
    enabled: Boolean(token && user),
  })
}
export function useToggleWishlist() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ product, existingItem }) => {
      if (existingItem) await api.removeWishlistItem(token, existingItem.id)
      else await api.addWishlistItem(token, product)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist(user?.id) }),
  })
}

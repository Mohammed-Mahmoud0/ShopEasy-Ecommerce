// All Java API shapes are translated here. Components use a small, stable view model.
const configuredBase = import.meta.env.VITE_API_BASE_URL || window.location.origin
export const API_ORIGIN = new URL(configuredBase).origin

const buildUrl = (path, params) => {
  const url = new URL(path, API_ORIGIN)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

async function request(path, options = {}) {
  const { token, body, params, headers, ...init } = options
  const isForm = body instanceof FormData
  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })

  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()
  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed')
    error.status = response.status
    error.data = data
    throw error
  }
  return data
}

const mapProduct = (product) => ({
  id: product.id,
  title: product.name,
  description: product.description,
  brand: product.brand,
  category: product.category,
  unit_price: Number(product.price),
  inventory: product.stockQuantity,
  is_available: product.active && product.stockQuantity > 0,
  images: product.imageUrl ? [{ id: product.id, image: product.imageUrl }] : [],
})

const mapCart = (cart) => ({
  items: (cart?.items || []).map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    total_price: Number(item.lineTotal),
    product: {
      id: item.productId,
      title: item.productName,
      unit_price: Number(item.unitPrice),
      images: [{ image: `/api/products/${item.productId}/image` }],
    },
  })),
  total_price: Number(cart?.total || 0),
})

const mapOrder = (order) => ({
  id: order.id,
  status: order.status,
  placed_at: order.createdAt,
  total_price: Number(order.total),
  items: (order.items || []).map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    unit_price: Number(item.unitPrice),
    total_price: Number(item.lineTotal),
    product: { id: item.productId, title: item.productName },
  })),
})

const wishlistKey = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return `shopeasy:wishlist:${payload.sub}`
  } catch {
    return 'shopeasy:wishlist:guest'
  }
}
const readWishlist = (token) => {
  try { return JSON.parse(localStorage.getItem(wishlistKey(token)) || '[]') }
  catch { return [] }
}
const writeWishlist = (token, items) => localStorage.setItem(wishlistKey(token), JSON.stringify(items))

export const api = {
  async getProducts(params = {}) {
    const data = await request('/api/products', {
      params: {
        page: Math.max(0, Number(params.page || 1) - 1),
        size: params.page_size || 12,
        search: params.search,
        category: params.collection_id,
        sort: params.ordering === 'unit_price' ? 'priceAsc'
          : params.ordering === '-unit_price' ? 'priceDesc'
            : params.ordering === '-last_update' ? 'newest' : 'nameAsc',
        minPrice: params.unit_price__gt,
        maxPrice: params.unit_price__lt,
      },
    })
    return { results: data.content.map(mapProduct), count: data.totalElements }
  },
  async getProduct(id) { return mapProduct(await request(`/api/products/${id}`)) },
  async getCollections() {
    const categories = await request('/api/products/categories')
    return categories.map((name) => ({ id: name, title: name }))
  },

  async login(credentials) {
    return request('/api/auth/login', { method: 'POST', body: credentials })
  },
  async register(payload) {
    return request('/api/auth/register', { method: 'POST', body: payload })
  },
  getCurrentUser(token) { return request('/api/users/me', { token }) },

  async getCart(token) { return mapCart(await request('/api/cart', { token })) },
  async addCartItem(token, item) {
    return mapCart(await request('/api/cart/items', {
      method: 'POST', token, body: { productId: item.productId, quantity: item.quantity },
    }))
  },
  async updateCartItem(token, productId, quantity) {
    return mapCart(await request(`/api/cart/items/${productId}`, {
      method: 'PUT', token, body: { quantity },
    }))
  },
  removeCartItem(token, productId) {
    return request(`/api/cart/items/${productId}`, { method: 'DELETE', token })
  },

  async getOrders(token, page = 1) {
    const data = await request('/api/orders', {
      token, params: { page: page - 1, size: 10 },
    })
    return { results: data.content.map(mapOrder), count: data.totalElements }
  },
  async getOrder(token, id) { return mapOrder(await request(`/api/orders/${id}`, { token })) },
  async createOrder(token) {
    return mapOrder(await request('/api/orders', { method: 'POST', token }))
  },
  async cancelOrder(token, id) {
    return mapOrder(await request(`/api/orders/${id}/cancel`, { method: 'PATCH', token }))
  },

  // Favorites are explicitly browser-local until the Java API supports wishlists.
  async getWishlist(token) { return readWishlist(token) },
  async addWishlistItem(token, product) {
    const items = readWishlist(token)
    if (!items.some((item) => item.product.id === product.id)) {
      writeWishlist(token, [...items, { id: product.id, product }])
    }
  },
  async removeWishlistItem(token, productId) {
    writeWishlist(token, readWishlist(token).filter((item) => item.id !== productId))
  },

  async getAdminProducts(token, page = 0) {
    return request('/api/admin/products', { token, params: { page, size: 20 } })
  },
  saveProduct(token, product, id) {
    return request(id ? `/api/products/${id}` : '/api/products', {
      method: id ? 'PUT' : 'POST', token, body: product,
    })
  },
  deactivateProduct(token, id) {
    return request(`/api/products/${id}`, { method: 'DELETE', token })
  },
  uploadProductImage(token, id, file) {
    const body = new FormData()
    body.append('file', file)
    return request(`/api/products/${id}/image`, { method: 'PUT', token, body })
  },
  getAdminOrders(token, page = 0) {
    return request('/api/admin/orders', { token, params: { page, size: 20 } })
  },
  setOrderStatus(token, id, status) {
    return request(`/api/admin/orders/${id}/status`, {
      method: 'PATCH', token, body: { status },
    })
  },
}

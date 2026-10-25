export const ORDER_FLOW = ['PLACED', 'SHIPPED', 'DELIVERED']
export const statusStepIndex = (status) => ORDER_FLOW.indexOf(status)
export const statusTone = (status) => ({
  PLACED: 'info', SHIPPED: 'brand', DELIVERED: 'success', CANCELLED: 'danger',
}[status] || 'neutral')
export const orderTotal = (order) => Number(order?.total_price || 0)
export const orderItemCount = (order) =>
  (order?.items || []).reduce((sum, item) => sum + item.quantity, 0)

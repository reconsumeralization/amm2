import { useState, useEffect, useCallback } from 'react'

export interface OrderItem {
  id: string
  product: string | {
    id: string
    name: string
    price: number
    images?: Array<{
      id: string
      url: string
    }>
  }
  variant?: string
  quantity: number
  price: number
  total: number
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  customer: string | {
    id: string
    name: string
    email?: string
    phone?: string
  }
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'partially-refunded'
  paymentMethod?: string
  stripePaymentIntentId?: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  shippingMethod?: string
  trackingNumber?: string
  notes?: string
  internalNotes?: string
  estimatedDeliveryDate?: string
  actualDeliveryDate?: string
  createdAt: string
  updatedAt: string
}

export interface OrderFilters {
  search?: string
  customer?: string
  status?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
  totalMin?: number
  totalMax?: number
  sort?: string
  limit?: number
  offset?: number
}

export interface OrderCreateInput {
  customer: string
  items: Array<{
    product: string
    variant?: string
    quantity: number
    price: number
    notes?: string
  }>
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  shippingMethod?: string
  notes?: string
  internalNotes?: string
}

export interface OrderUpdateInput extends Partial<OrderCreateInput> {
  id: string
  status?: Order['status']
  paymentStatus?: Order['paymentStatus']
  trackingNumber?: string
  estimatedDeliveryDate?: string
  actualDeliveryDate?: string
}

export interface OrderAnalytics {
  overview: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
    cancelledOrders: number
  }
  statusBreakdown: Array<{
    status: string
    count: number
    percentage: number
    totalValue: number
  }>
  productPerformance: Array<{
    productId: string
    productName: string
    totalSold: number
    totalRevenue: number
    averagePrice: number
  }>
  revenueTrends: Array<{
    date: string
    orderCount: number
    totalRevenue: number
  }>
  customerAnalytics: {
    uniqueCustomers: number
    repeatCustomers: number
    averageOrdersPerCustomer: number
    topCustomers: Array<{
      customerId: string
      customerName: string
      orderCount: number
      totalSpent: number
    }>
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null)

  // Fetch orders
  const fetchOrders = useCallback(async (filters?: OrderFilters) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v.toString()))
            } else {
              queryParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await fetch(`/api/orders?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single order
  const getOrder = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch order')
      }

      const order = await response.json()
      return order
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create order
  const createOrder = useCallback(async (orderData: OrderCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const newOrder = await response.json()
      setOrders(prev => [newOrder, ...prev])
      return newOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update order
  const updateOrder = useCallback(async (orderData: OrderUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      const updatedOrder = await response.json()
      setOrders(prev =>
        prev.map(order =>
          order.id === orderData.id ? updatedOrder : order
        )
      )
      return updatedOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete order
  const deleteOrder = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      setOrders(prev => prev.filter(order => order.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Cancel order
  const cancelOrder = useCallback(async (id: string, reason?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel order')
      }

      const cancelledOrder = await response.json()
      setOrders(prev =>
        prev.map(order =>
          order.id === id ? cancelledOrder : order
        )
      )
      return cancelledOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Process payment
  const processPayment = useCallback(async (id: string, paymentMethodId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      })

      if (!response.ok) {
        throw new Error('Failed to process payment')
      }

      const paymentResult = await response.json()
      return paymentResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Refund order
  const refundOrder = useCallback(async (id: string, amount?: number, reason?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, reason }),
      })

      if (!response.ok) {
        throw new Error('Failed to refund order')
      }

      const refundResult = await response.json()
      return refundResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refund order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update shipping info
  const updateShippingInfo = useCallback(async (id: string, trackingNumber: string, carrier?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}/shipping`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber, carrier }),
      })

      if (!response.ok) {
        throw new Error('Failed to update shipping info')
      }

      const updatedOrder = await response.json()
      setOrders(prev =>
        prev.map(order =>
          order.id === id ? updatedOrder : order
        )
      )
      return updatedOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update shipping info'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk operations
  const bulkUpdateOrders = useCallback(async (orderIds: string[], updates: Partial<OrderUpdateInput>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/orders/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: orderIds, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk update orders')
      }

      const updatedOrders = await response.json()

      // Update local state
      setOrders(prev =>
        prev.map(order => {
          const updated = updatedOrders.find((o: Order) => o.id === order.id)
          return updated || order
        })
      )

      return updatedOrders
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update orders'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Analytics
  const fetchAnalytics = useCallback(async (dateRange?: { start: string; end: string }) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (dateRange) {
        queryParams.append('startDate', dateRange.start)
        queryParams.append('endDate', dateRange.end)
      }

      const response = await fetch(`/api/orders/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch order analytics')
      }

      const analyticsData = await response.json()
      setAnalytics(analyticsData)
      return analyticsData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Generate invoice
  const generateInvoice = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}/invoice`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate invoice')
      }

      const invoice = await response.json()
      return invoice
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate invoice'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    orders,
    loading,
    error,
    analytics,

    // Actions
    fetchOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    cancelOrder,
    processPayment,
    refundOrder,
    updateShippingInfo,
    bulkUpdateOrders,
    fetchAnalytics,
    generateInvoice,
    clearError,
  }
}

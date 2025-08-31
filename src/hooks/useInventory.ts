import { useState, useEffect, useCallback } from 'react'

export interface InventoryItem {
  id: string
  product: string | {
    id: string
    name: string
    sku?: string
    category?: string
  }
  location?: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  minThreshold: number
  maxThreshold: number
  unit: string
  unitCost?: number
  totalValue?: number
  lastStockUpdate: string
  expiryDate?: string
  batchNumber?: string
  supplier?: string
  notes?: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
  createdAt: string
  updatedAt: string
}

export interface InventoryFilters {
  product?: string
  location?: string
  status?: string
  category?: string
  lowStock?: boolean
  expired?: boolean
  expiringSoon?: boolean
  dateFrom?: string
  dateTo?: string
  sort?: string
  limit?: number
  offset?: number
}

export interface InventoryCreateInput {
  product: string
  location?: string
  quantity: number
  minThreshold: number
  maxThreshold: number
  unit: string
  unitCost?: number
  expiryDate?: string
  batchNumber?: string
  supplier?: string
  notes?: string
}

export interface InventoryUpdateInput extends Partial<InventoryCreateInput> {
  id: string
  quantity?: number
  reservedQuantity?: number
}

export interface InventoryAnalytics {
  overview: {
    totalItems: number
    totalValue: number
    inStockItems: number
    lowStockItems: number
    outOfStockItems: number
    expiringItems: number
    expiredItems: number
  }
  categories: Array<{
    category: string
    itemCount: number
    totalValue: number
    averageValue: number
  }>
  locations: Array<{
    location: string
    itemCount: number
    totalValue: number
  }>
  trends: Array<{
    date: string
    stockIn: number
    stockOut: number
    totalValue: number
  }>
  alerts: {
    lowStock: InventoryItem[]
    outOfStock: InventoryItem[]
    expiringSoon: InventoryItem[]
    expired: InventoryItem[]
  }
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null)

  // Fetch inventory
  const fetchInventory = useCallback(async (filters?: InventoryFilters) => {
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

      const response = await fetch(`/api/inventory?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch inventory')
      }

      const data = await response.json()
      setInventory(data.inventory || data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single inventory item
  const getInventoryItem = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/inventory/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch inventory item')
      }

      const inventoryItem = await response.json()
      return inventoryItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create inventory item
  const createInventoryItem = useCallback(async (inventoryData: InventoryCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
      })

      if (!response.ok) {
        throw new Error('Failed to create inventory item')
      }

      const newInventoryItem = await response.json()
      setInventory(prev => [newInventoryItem, ...prev])
      return newInventoryItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create inventory item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update inventory item
  const updateInventoryItem = useCallback(async (inventoryData: InventoryUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/inventory/${inventoryData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
      })

      if (!response.ok) {
        throw new Error('Failed to update inventory item')
      }

      const updatedInventoryItem = await response.json()
      setInventory(prev =>
        prev.map(item =>
          item.id === inventoryData.id ? updatedInventoryItem : item
        )
      )
      return updatedInventoryItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inventory item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete inventory item
  const deleteInventoryItem = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete inventory item')
      }

      setInventory(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete inventory item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Adjust stock
  const adjustStock = useCallback(async (id: string, quantity: number, reason?: string, notes?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/inventory/${id}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, reason, notes }),
      })

      if (!response.ok) {
        throw new Error('Failed to adjust stock')
      }

      const updatedItem = await response.json()
      setInventory(prev =>
        prev.map(item =>
          item.id === id ? updatedItem : item
        )
      )
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to adjust stock'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Reserve stock
  const reserveStock = useCallback(async (id: string, quantity: number, reservationId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/inventory/${id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, reservationId }),
      })

      if (!response.ok) {
        throw new Error('Failed to reserve stock')
      }

      const updatedItem = await response.json()
      setInventory(prev =>
        prev.map(item =>
          item.id === id ? updatedItem : item
        )
      )
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reserve stock'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Release reserved stock
  const releaseReservedStock = useCallback(async (id: string, quantity: number, reservationId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/inventory/${id}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, reservationId }),
      })

      if (!response.ok) {
        throw new Error('Failed to release reserved stock')
      }

      const updatedItem = await response.json()
      setInventory(prev =>
        prev.map(item =>
          item.id === id ? updatedItem : item
        )
      )
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to release reserved stock'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk update
  const bulkUpdateInventory = useCallback(async (itemIds: string[], updates: Partial<InventoryUpdateInput>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/inventory/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: itemIds, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk update inventory')
      }

      const updatedItems = await response.json()

      // Update local state
      setInventory(prev =>
        prev.map(item => {
          const updated = updatedItems.find((i: InventoryItem) => i.id === item.id)
          return updated || item
        })
      )

      return updatedItems
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update inventory'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk delete
  const bulkDeleteInventory = useCallback(async (itemIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/inventory/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: itemIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk delete inventory')
      }

      setInventory(prev => prev.filter(item => !itemIds.includes(item.id)))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete inventory'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get low stock alerts
  const getLowStockAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/inventory/low-stock')
      if (!response.ok) {
        throw new Error('Failed to fetch low stock alerts')
      }

      const alerts = await response.json()
      return alerts
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch low stock alerts'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Get expiring items
  const getExpiringItems = useCallback(async (days: number = 30) => {
    try {
      const response = await fetch(`/api/inventory/expiring?days=${days}`)
      if (!response.ok) {
        throw new Error('Failed to fetch expiring items')
      }

      const items = await response.json()
      return items
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expiring items'
      setError(errorMessage)
      throw err
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

      const response = await fetch(`/api/inventory/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch inventory analytics')
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

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    inventory,
    loading,
    error,
    analytics,

    // Actions
    fetchInventory,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    reserveStock,
    releaseReservedStock,
    bulkUpdateInventory,
    bulkDeleteInventory,
    getLowStockAlerts,
    getExpiringItems,
    fetchAnalytics,
    clearError,
  }
}

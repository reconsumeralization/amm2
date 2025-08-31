import { useState, useEffect, useCallback } from 'react'

export interface Product {
  id: string
  name: string
  slug: string
  description?: any // Rich text
  shortDescription?: string
  category: string
  subcategory?: string
  brand?: string
  price: number
  originalPrice?: number
  cost?: number
  taxRate?: number
  sku?: string
  barcode?: string
  images?: Array<{
    id: string
    url: string
    alt?: string
    isPrimary?: boolean
  }>
  variants?: Array<{
    id: string
    name: string
    price: number
    stockLevel: number
    sku?: string
    attributes: Record<string, string>
  }>
  stockLevel: number
  minStockLevel?: number
  maxStockLevel?: number
  trackInventory: boolean
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit: 'cm' | 'in'
  }
  tags?: string[]
  isActive: boolean
  isFeatured?: boolean
  featuredOrder?: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  relatedProducts?: string[]
  crossSellProducts?: string[]
  upSellProducts?: string[]
  reviews?: Array<{
    id: string
    userId: string
    userName: string
    rating: number
    comment?: string
    verified: boolean
    createdAt: string
  }>
  averageRating?: number
  reviewCount?: number
  salesCount?: number
  viewCount?: number
  wishlistCount?: number
  shipping?: {
    freeShipping?: boolean
    shippingClass?: string
    handlingTime?: number
  }
  attributes?: Array<{
    name: string
    value: string
    isFilterable?: boolean
  }>
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  search?: string
  category?: string
  subcategory?: string
  brand?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  isActive?: boolean
  isFeatured?: boolean
  tags?: string[]
  attributes?: Record<string, string>
  sort?: string
  limit?: number
  offset?: number
}

export interface ProductCreateInput {
  name: string
  slug: string
  description?: any
  shortDescription?: string
  category: string
  subcategory?: string
  brand?: string
  price: number
  originalPrice?: number
  cost?: number
  taxRate?: number
  sku?: string
  barcode?: string
  stockLevel: number
  minStockLevel?: number
  maxStockLevel?: number
  trackInventory?: boolean
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit: 'cm' | 'in'
  }
  tags?: string[]
  isActive?: boolean
  isFeatured?: boolean
  featuredOrder?: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  relatedProducts?: string[]
  crossSellProducts?: string[]
  upSellProducts?: string[]
  shipping?: {
    freeShipping?: boolean
    shippingClass?: string
    handlingTime?: number
  }
  attributes?: Array<{
    name: string
    value: string
    isFilterable?: boolean
  }>
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {
  id: string
}

export interface ProductAnalytics {
  overview: {
    totalProducts: number
    activeProducts: number
    featuredProducts: number
    outOfStockProducts: number
    lowStockProducts: number
    totalValue: number
    averagePrice: number
    totalSales: number
    totalRevenue: number
  }
  categories: Array<{
    category: string
    productCount: number
    totalValue: number
    salesCount: number
  }>
  performance: Array<{
    productId: string
    productName: string
    salesCount: number
    revenue: number
    views: number
    conversionRate: number
    averageRating: number
  }>
  inventory: {
    inStock: number
    lowStock: number
    outOfStock: number
    totalStockValue: number
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null)

  // Fetch products
  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v.toString()))
            } else if (typeof value === 'object') {
              queryParams.append(key, JSON.stringify(value))
            } else {
              queryParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await fetch(`/api/products?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.products || data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single product
  const getProduct = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }

      const product = await response.json()
      return product
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create product
  const createProduct = useCallback(async (productData: ProductCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      const newProduct = await response.json()
      setProducts(prev => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update product
  const updateProduct = useCallback(async (productData: ProductUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${productData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      const updatedProduct = await response.json()
      setProducts(prev =>
        prev.map(product =>
          product.id === productData.id ? updatedProduct : product
        )
      )
      return updatedProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete product
  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      setProducts(prev => prev.filter(product => product.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Duplicate product
  const duplicateProduct = useCallback(async (id: string, newName?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      })

      if (!response.ok) {
        throw new Error('Failed to duplicate product')
      }

      const duplicatedProduct = await response.json()
      setProducts(prev => [duplicatedProduct, ...prev])
      return duplicatedProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate product'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk operations
  const bulkUpdateProducts = useCallback(async (productIds: string[], updates: Partial<ProductCreateInput>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: productIds, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk update products')
      }

      const updatedProducts = await response.json()

      // Update local state
      setProducts(prev =>
        prev.map(product => {
          const updated = updatedProducts.find((p: Product) => p.id === product.id)
          return updated || product
        })
      )

      return updatedProducts
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update products'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDeleteProducts = useCallback(async (productIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: productIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk delete products')
      }

      setProducts(prev => prev.filter(product => !productIds.includes(product.id)))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete products'
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

      const response = await fetch(`/api/products/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product analytics')
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
    products,
    loading,
    error,
    analytics,

    // Actions
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    bulkUpdateProducts,
    bulkDeleteProducts,
    fetchAnalytics,
    clearError,
  }
}

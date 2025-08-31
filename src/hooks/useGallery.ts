import { useState, useEffect, useCallback } from 'react'

export interface GalleryItem {
  id: string
  title: string
  slug: string
  description?: string
  image: {
    id: string
    url: string
    alt?: string
    width?: number
    height?: number
    filename?: string
    mimeType?: string
    filesize?: number
  }
  category?: 'general' | 'portfolio' | 'before-after' | 'events' | 'team'
  tags?: string[]
  featured?: boolean
  altText?: string
  photographer?: string
  dateTaken?: string
  location?: string
  camera?: string
  settings?: {
    aperture?: string
    shutterSpeed?: string
    iso?: number
    focalLength?: string
  }
  seoTitle?: string
  seoDescription?: string
  viewCount?: number
  likeCount?: number
  downloadCount?: number
  createdAt: string
  updatedAt: string
}

export interface GalleryFilters {
  search?: string
  category?: 'general' | 'portfolio' | 'before-after' | 'events' | 'team'
  tags?: string[]
  featured?: boolean
  photographer?: string
  dateFrom?: string
  dateTo?: string
  sort?: 'createdAt' | 'updatedAt' | 'title' | 'featured' | 'viewCount' | 'likeCount'
  order?: 'asc' | 'desc'
  limit?: number
  page?: number
}

export interface GalleryCreateInput {
  title: string
  slug?: string
  description?: string
  image: string // Media ID
  category?: 'general' | 'portfolio' | 'before-after' | 'events' | 'team'
  tags?: string[]
  featured?: boolean
  altText?: string
  photographer?: string
  dateTaken?: string
  location?: string
  camera?: string
  settings?: {
    aperture?: string
    shutterSpeed?: string
    iso?: number
    focalLength?: string
  }
  seoTitle?: string
  seoDescription?: string
}

export interface GalleryUpdateInput extends Partial<GalleryCreateInput> {
  id: string
}

export interface GalleryResponse {
  docs: GalleryItem[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export interface GalleryAnalytics {
  overview: {
    totalItems: number
    featuredItems: number
    totalViews: number
    totalLikes: number
    totalDownloads: number
  }
  categories: Array<{
    category: string
    itemCount: number
    totalViews: number
    totalLikes: number
  }>
  photographers: Array<{
    photographer: string
    itemCount: number
    totalViews: number
    totalLikes: number
  }>
  performance: Array<{
    itemId: string
    itemTitle: string
    views: number
    likes: number
    downloads: number
    engagementRate: number
  }>
  trends: Array<{
    date: string
    uploads: number
    views: number
    likes: number
  }>
}

export function useGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<GalleryAnalytics | null>(null)

  // Fetch gallery items
  const fetchGalleryItems = useCallback(async (filters?: GalleryFilters) => {
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

      const response = await fetch(`/api/gallery?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items')
      }

      const data: GalleryResponse = await response.json()
      setGalleryItems(data.docs)
      setTotalItems(data.totalDocs)
      setCurrentPage(data.page)
      setTotalPages(data.totalPages)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch gallery items'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single gallery item
  const getGalleryItem = useCallback(async (idOrSlug: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/gallery/${idOrSlug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch gallery item')
      }

      const galleryItem = await response.json()
      return galleryItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch gallery item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get gallery item by slug
  const getGalleryItemBySlug = useCallback(async (slug: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/gallery/slug/${slug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch gallery item')
      }

      const galleryItem = await response.json()
      return galleryItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch gallery item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create gallery item
  const createGalleryItem = useCallback(async (galleryData: GalleryCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(galleryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create gallery item')
      }

      const newGalleryItem = await response.json()
      setGalleryItems(prev => [newGalleryItem, ...prev])
      setTotalItems(prev => prev + 1)
      return newGalleryItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create gallery item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update gallery item
  const updateGalleryItem = useCallback(async (galleryData: GalleryUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/gallery/${galleryData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(galleryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update gallery item')
      }

      const updatedGalleryItem = await response.json()
      setGalleryItems(prev =>
        prev.map(item =>
          item.id === galleryData.id ? updatedGalleryItem : item
        )
      )
      return updatedGalleryItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update gallery item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete gallery item
  const deleteGalleryItem = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete gallery item')
      }

      setGalleryItems(prev => prev.filter(item => item.id !== id))
      setTotalItems(prev => prev - 1)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete gallery item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Duplicate gallery item
  const duplicateGalleryItem = useCallback(async (id: string, newTitle?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/gallery/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to duplicate gallery item')
      }

      const duplicatedItem = await response.json()
      setGalleryItems(prev => [duplicatedItem, ...prev])
      setTotalItems(prev => prev + 1)
      return duplicatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate gallery item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Like gallery item
  const likeGalleryItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/gallery/${id}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to like gallery item')
      }

      const result = await response.json()

      // Update local state
      setGalleryItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, likeCount: (item.likeCount || 0) + 1 }
            : item
        )
      )

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like gallery item'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Download gallery item
  const downloadGalleryItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/gallery/${id}/download`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to download gallery item')
      }

      const result = await response.json()

      // Update local state
      setGalleryItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, downloadCount: (item.downloadCount || 0) + 1 }
            : item
        )
      )

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download gallery item'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Bulk operations
  const bulkUpdateGalleryItems = useCallback(async (itemIds: string[], updates: Partial<GalleryCreateInput>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gallery/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: itemIds, updates }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to bulk update gallery items')
      }

      const updatedItems = await response.json()

      // Update local state
      setGalleryItems(prev =>
        prev.map(item => {
          const updated = updatedItems.find((i: GalleryItem) => i.id === item.id)
          return updated || item
        })
      )

      return updatedItems
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update gallery items'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDeleteGalleryItems = useCallback(async (itemIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gallery/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: itemIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to bulk delete gallery items')
      }

      setGalleryItems(prev => prev.filter(item => !itemIds.includes(item.id)))
      setTotalItems(prev => prev - itemIds.length)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete gallery items'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get categories
  const getCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/gallery/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const categories = await response.json()
      return categories
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Get tags
  const getTags = useCallback(async () => {
    try {
      const response = await fetch('/api/gallery/tags')
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }

      const tags = await response.json()
      return tags
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tags'
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

      const response = await fetch(`/api/gallery/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch gallery analytics')
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

  // Initialize gallery items on mount
  useEffect(() => {
    fetchGalleryItems()
  }, [fetchGalleryItems])

  return {
    // State
    galleryItems,
    totalItems,
    currentPage,
    totalPages,
    loading,
    error,
    analytics,

    // Actions
    fetchGalleryItems,
    getGalleryItem,
    getGalleryItemBySlug,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    duplicateGalleryItem,
    likeGalleryItem,
    downloadGalleryItem,
    bulkUpdateGalleryItems,
    bulkDeleteGalleryItems,
    getCategories,
    getTags,
    fetchAnalytics,
    clearError,
  }
}

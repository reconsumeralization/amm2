import { useState, useEffect, useCallback } from 'react'

export interface MediaItem {
  id: string
  filename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  alt?: string
  caption?: string
  url: string
  thumbnailURL?: string
  sizes?: Record<string, {
    width: number
    height: number
    mimeType: string
    filesize: number
    filename: string
    url: string
  }>
  focalX?: number
  focalY?: number
  createdAt: string
  updatedAt: string
}

export interface MediaFilters {
  search?: string
  mimeType?: string
  width?: number
  height?: number
  dateFrom?: string
  dateTo?: string
  sort?: string
  limit?: number
  offset?: number
}

export interface MediaUploadInput {
  file: File
  alt?: string
  caption?: string
  focalX?: number
  focalY?: number
}

export interface MediaUpdateInput {
  id: string
  alt?: string
  caption?: string
  focalX?: number
  focalY?: number
}

export interface MediaAnalytics {
  overview: {
    totalFiles: number
    totalSize: number
    imagesCount: number
    videosCount: number
    documentsCount: number
    otherCount: number
  }
  types: Array<{
    mimeType: string
    count: number
    totalSize: number
  }>
  usage: {
    usedInContent: number
    unused: number
    totalUsage: number
  }
  trends: Array<{
    date: string
    uploads: number
    totalSize: number
  }>
}

export function useMedia() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<MediaAnalytics | null>(null)

  // Fetch media
  const fetchMedia = useCallback(async (filters?: MediaFilters) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v: any) => queryParams.append(key, v.toString()))
            } else {
              queryParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await fetch(`/api/media?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch media')
      }

      const data = await response.json()
      setMedia(data.media || data)
      return data
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch media'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single media item
  const getMedia = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/media/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch media item')
      }

      const mediaItem = await response.json()
      return mediaItem
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch media item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Upload media
  const uploadMedia = useCallback(async (uploadData: MediaUploadInput) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadData.file)

      if (uploadData.alt) formData.append('alt', uploadData.alt)
      if (uploadData.caption) formData.append('caption', uploadData.caption)
      if (uploadData.focalX) formData.append('focalX', uploadData.focalX.toString())
      if (uploadData.focalY) formData.append('focalY', uploadData.focalY.toString())

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload media')
      }

      const newMediaItem = await response.json()
      setMedia(prev => [newMediaItem, ...prev])
      return newMediaItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload media'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update media
  const updateMedia = useCallback(async (mediaData: MediaUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/media/${mediaData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mediaData),
      })

      if (!response.ok) {
        throw new Error('Failed to update media')
      }

      const updatedMediaItem = await response.json()
      setMedia(prev =>
        prev.map(mediaItem =>
          mediaItem.id === mediaData.id ? updatedMediaItem : mediaItem
        )
      )
      return updatedMediaItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update media'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete media
  const deleteMedia = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete media')
      }

      setMedia(prev => prev.filter(mediaItem => mediaItem.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete media'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Generate thumbnail
  const generateThumbnail = useCallback(async (id: string, width?: number, height?: number) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (width) queryParams.append('width', width.toString())
      if (height) queryParams.append('height', height.toString())

      const response = await fetch(`/api/media/${id}/thumbnail?${queryParams.toString()}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate thumbnail')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate thumbnail'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk upload
  const bulkUploadMedia = useCallback(async (files: File[], defaultAlt?: string) => {
    setLoading(true)
    setError(null)

    try {
      const uploadPromises = files.map(file => {
        const uploadData: MediaUploadInput = {
          file,
          alt: defaultAlt || file.name,
        }
        return uploadMedia(uploadData)
      })

      const results = await Promise.all(uploadPromises)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk upload media'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [uploadMedia])

  // Bulk delete
  const bulkDeleteMedia = useCallback(async (mediaIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/media/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: mediaIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk delete media')
      }

      setMedia(prev => prev.filter(mediaItem => !mediaIds.includes(mediaItem.id)))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete media'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get media usage
  const getMediaUsage = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/media/${id}/usage`)
      if (!response.ok) {
        throw new Error('Failed to fetch media usage')
      }

      const usage = await response.json()
      return usage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch media usage'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Optimize media
  const optimizeMedia = useCallback(async (id: string, quality?: number, format?: string) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (quality) queryParams.append('quality', quality.toString())
      if (format) queryParams.append('format', format)

      const response = await fetch(`/api/media/${id}/optimize?${queryParams.toString()}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to optimize media')
      }

      const optimizedMedia = await response.json()

      // Update local state
      setMedia(prev =>
        prev.map(mediaItem =>
          mediaItem.id === id ? optimizedMedia : mediaItem
        )
      )

      return optimizedMedia
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize media'
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

      const response = await fetch(`/api/media/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch media analytics')
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
    media,
    loading,
    error,
    analytics,

    // Actions
    fetchMedia,
    getMedia,
    uploadMedia,
    updateMedia,
    deleteMedia,
    generateThumbnail,
    bulkUploadMedia,
    bulkDeleteMedia,
    getMediaUsage,
    optimizeMedia,
    fetchAnalytics,
    clearError,
  }
}

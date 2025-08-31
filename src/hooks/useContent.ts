import { useState, useEffect, useCallback } from 'react'
import { ContentCreateInput, ContentUpdateInput } from '@/lib/validation'

export interface Content {
  id: string
  title: string
  slug: string
  description?: string
  content: any
  lexicalContent?: any
  status: 'draft' | 'published' | 'archived' | 'scheduled'
  publishDate?: string
  version: number
  parentVersion?: string
  pageType: 'landing' | 'about' | 'services' | 'contact' | 'blog' | 'gallery' | 'custom'
  category?: string
  tags: Array<{ tag: string }>
  featured: boolean
  featuredOrder: number
  seo?: {
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string
    canonicalUrl?: string
    ogImage?: string
    ogTitle?: string
    ogDescription?: string
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  }
  analytics?: {
    viewCount: number
    uniqueVisitors: number
    averageTimeOnPage: number
    bounceRate: number
    conversionRate: number
    lastAnalyticsUpdate?: string
  }
  settings?: {
    showTableOfContents: boolean
    enableComments: boolean
    enableSharing: boolean
    passwordProtected: boolean
    password?: string
    customCss?: string
    customJs?: string
  }
  media: Array<{
    file: string
    alt?: string
    caption?: string
    position?: number
    featured?: boolean
  }>
  revisions: Array<{
    id: string
    version: number
    content: any
    lexicalContent?: any
    changedBy: string
    changeDescription?: string
    createdAt: string
  }>
  template?: string
  theme?: string
  tenant?: string
  createdBy: string
  updatedBy: string
  publishedBy?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ContentFilters {
  search?: string
  status?: 'draft' | 'published' | 'archived' | 'scheduled' | 'all'
  pageType?: string
  category?: string
  featured?: boolean
  template?: string
  tenant?: string
  sort?: string
}

export interface ContentAnalytics {
  overview: {
    totalContent: number
    publishedContent: number
    draftContent: number
    featuredContent: number
    recentContent: number
    averageViewsPerContent: number
    averageTimeOnPage: number
    totalViews: number
    totalUniqueVisitors: number
  }
  distribution: {
    byType: { [key: string]: number }
    byStatus: { [key: string]: number }
  }
  performance: {
    topViewedContent: Array<{
      id: string
      title: string
      slug: string
      views: number
      uniqueVisitors: number
      averageTime: number
      publishedAt?: string
    }>
    contentTrend: Array<{
      date: string
      count: number
    }>
  }
  dateRange?: {
    startDate?: string
    endDate?: string
  }
}

// Hook for managing content data
export function useContent() {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchContent = useCallback(async (
    filters: ContentFilters = {},
    page: number = 1,
    limit: number = 10
  ) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, String(value)])
        )
      })

      const response = await fetch(`/api/content?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }

      const data = await response.json()

      setContent(data.content || [])
      setTotalDocs(data.total || 0)
      setTotalPages(data.totalPages || 0)
      setCurrentPage(data.page || 1)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching content:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createContent = useCallback(async (contentData: ContentCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create content')
      }

      const data = await response.json()

      // Add the new content to the list
      setContent(prev => [data.content, ...prev])
      setTotalDocs(prev => prev + 1)

      return data.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateContent = useCallback(async (id: string, contentData: ContentUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...contentData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update content')
      }

      const data = await response.json()

      // Update the content in the list
      setContent(prev => prev.map(item =>
        item.id === id ? data.content : item
      ))

      return data.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteContent = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete content')
      }

      // Remove the content from the list
      setContent(prev => prev.filter(item => item.id !== id))
      setTotalDocs(prev => prev - 1)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const publishContent = useCallback(async (id: string) => {
    return updateContent(id, { status: 'published' })
  }, [updateContent])

  const archiveContent = useCallback(async (id: string) => {
    return updateContent(id, { status: 'archived' })
  }, [updateContent])

  const duplicateContent = useCallback(async (id: string, newTitle?: string) => {
    const originalContent = content.find(item => item.id === id)
    if (!originalContent) {
      throw new Error('Content not found')
    }

    const duplicatedData = {
      ...originalContent,
      title: newTitle || `${originalContent.title} (Copy)`,
      slug: `${originalContent.slug}-copy`,
      status: 'draft' as const,
      featured: false,
      version: 1,
    }

    // Remove fields that shouldn't be duplicated using object destructuring
    const {
      id: contentId,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
      publishedBy,
      publishedAt,
      ...cleanData
    } = duplicatedData

    // Create the final data object with publishDate as Date
    const dataToCreate = {
      ...cleanData,
      publishDate: new Date(),
    }

    return createContent(dataToCreate)
  }, [content, createContent])

  return {
    content,
    loading,
    error,
    totalDocs,
    totalPages,
    currentPage,
    fetchContent,
    createContent,
    updateContent,
    deleteContent,
    publishContent,
    archiveContent,
    duplicateContent,
  }
}

// Hook for content analytics
export function useContentAnalytics() {
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/content/analytics?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch content analytics')
      }

      const data = await response.json()
      setAnalytics(data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching content analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  }
}

// Hook for individual content data
export function useContentItem(id: string | null) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/content?slug=${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setContent(null)
          return
        }
        throw new Error('Failed to fetch content')
      }

      const data = await response.json()
      const contentItem = data.content?.[0] || null
      setContent(contentItem)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching content:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  return {
    content,
    loading,
    error,
    refetch: fetchContent,
  }
}

// Hook for content versioning
export function useContentVersions() {
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalVersions, setTotalVersions] = useState(0)

  const fetchVersions = useCallback(async (contentId: string, page: number = 1, limit: number = 10) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        contentId,
        page: page.toString(),
        limit: limit.toString(),
      })

      const response = await fetch(`/api/content/versioning?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch content versions')
      }

      const data = await response.json()
      setVersions(data.revisions || [])
      setTotalVersions(data.total || 0)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching content versions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const restoreVersion = useCallback(async (contentId: string, versionId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content/versioning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          versionId,
          action: 'restore'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to restore version')
      }

      const data = await response.json()
      return data.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    versions,
    loading,
    error,
    totalVersions,
    fetchVersions,
    restoreVersion,
  }
}

// Hook for content templates
export function useContentTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchTemplates = useCallback(async (
    category?: string,
    search?: string,
    page: number = 1,
    limit: number = 20
  ) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (category) params.set('category', category)
      if (search) params.set('search', search)

      const response = await fetch(`/api/content/templates?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }

      const data = await response.json()
      setTemplates(data.templates || [])
      setTotalDocs(data.total || 0)
      setTotalPages(data.totalPages || 0)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTemplate = useCallback(async (templateData: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create template')
      }

      const data = await response.json()

      // Add the new template to the list
      setTemplates(prev => [data.template, ...prev])
      setTotalDocs(prev => prev + 1)

      return data.template
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    templates,
    loading,
    error,
    totalDocs,
    totalPages,
    fetchTemplates,
    createTemplate,
  }
}

// Hook for editor state management
export function useEditor() {
  const [editorState, setEditorState] = useState<any>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const updateEditorState = useCallback((newState: any) => {
    setEditorState(newState)
    setIsDirty(true)
  }, [])

  const saveContent = useCallback(async (contentId: string, content: any) => {
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contentId,
          content,
          lexicalContent: editorState,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      setIsDirty(false)
      setLastSaved(new Date())

      const data = await response.json()
      return data.content
    } catch (error) {
      console.error('Error saving content:', error)
      throw error
    }
  }, [editorState])

  const resetEditor = useCallback(() => {
    setEditorState(null)
    setIsDirty(false)
    setLastSaved(null)
  }, [])

  return {
    editorState,
    isDirty,
    autoSaveEnabled,
    lastSaved,
    updateEditorState,
    saveContent,
    resetEditor,
    setAutoSaveEnabled,
  }
}

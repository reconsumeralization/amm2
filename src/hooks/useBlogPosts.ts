'use client'

import { useState, useEffect, useCallback } from 'react'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content?: any // Rich text content from Payload
  hero?: {
    id: string
    url: string
    alt?: string
    filename?: string
    mimeType?: string
    width?: number
    height?: number
  }
  author?: string | {
    id: string
    name: string
    bio?: string
    avatar?: {
      id: string
      url: string
      alt?: string
    }
  }
  tags?: Array<{
    tag: string
  }>
  category?: 'hair-care' | 'styling-tips' | 'trends' | 'product-reviews' | 'tutorials' | 'industry-news'
  readingTime?: number
  featured?: boolean
  published?: boolean
  publishedAt?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: {
      id: string
      url: string
      alt?: string
    }
    keywords?: Array<{
      keyword: string
    }>
  }
  relatedPosts?: string[]
  viewCount?: number
  likeCount?: number
  commentCount?: number
  createdAt: string
  updatedAt: string
}

export interface BlogPostFilters {
  search?: string
  author?: string
  category?: string
  tags?: string[]
  featured?: boolean
  published?: boolean
  dateFrom?: string
  dateTo?: string
  sort?: 'createdAt' | '-createdAt' | 'publishedAt' | '-publishedAt' | 'title' | '-title'
  limit?: number
  page?: number
}

export interface BlogPostCreateInput {
  title: string
  slug?: string
  excerpt?: string
  content?: any
  hero?: string // Media ID
  author?: string // Relationship ID
  category?: string
  tags?: Array<{ tag: string }>
  readingTime?: number
  featured?: boolean
  published?: boolean
  publishedAt?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: string // Media ID
    keywords?: Array<{ keyword: string }>
  }
}

export interface BlogPostUpdateInput extends Partial<BlogPostCreateInput> {
  id: string
}

export interface BlogPostAnalytics {
  overview: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    featuredPosts: number
    totalViews: number
    totalLikes: number
    averageReadingTime: number
  }
  categories: Array<{
    category: string
    postCount: number
    totalViews: number
    averageLikes: number
  }>
  authors: Array<{
    authorId: string
    authorName: string
    postCount: number
    totalViews: number
    averageLikes: number
  }>
  performance: Array<{
    postId: string
    postTitle: string
    views: number
    likes: number
    comments: number
    averageReadingTime: number
    publishDate: string
  }>
  engagement: {
    averageViewsPerPost: number
    averageLikesPerPost: number
    averageCommentsPerPost: number
    topPerformingPosts: Array<{
      id: string
      title: string
      views: number
      engagementRate: number
    }>
  }
}

export interface BlogPostResponse {
  docs: BlogPost[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage?: number
  nextPage?: number
}

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<BlogPostAnalytics | null>(null)
  const [pagination, setPagination] = useState<{
    totalDocs: number
    totalPages: number
    page: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null>(null)

  // Fetch blog posts with Payload CMS structure
  const fetchBlogPosts = useCallback(async (filters?: BlogPostFilters) => {
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

      const response = await fetch(`/api/blog-posts?${queryParams.toString()}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch blog posts')
      }

      const data: BlogPostResponse = await response.json()
      setBlogPosts(data.docs || [])
      setPagination({
        totalDocs: data.totalDocs,
        totalPages: data.totalPages,
        page: data.page,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
      })
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog posts'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single blog post
  const getBlogPost = useCallback(async (idOrSlug: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/blog-posts/${idOrSlug}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch blog post')
      }

      const blogPost = await response.json()
      return blogPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog post'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get blog post by slug
  const getBlogPostBySlug = useCallback(async (slug: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/blog-posts?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch blog post')
      }

      const data: BlogPostResponse = await response.json()
      const blogPost = data.docs[0]
      
      if (!blogPost) {
        throw new Error('Blog post not found')
      }

      return blogPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog post'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create blog post
  const createBlogPost = useCallback(async (blogPostData: BlogPostCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogPostData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create blog post')
      }

      const newBlogPost = await response.json()
      setBlogPosts(prev => [newBlogPost, ...prev])
      return newBlogPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog post'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update blog post
  const updateBlogPost = useCallback(async (blogPostData: BlogPostUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const { id, ...updateData } = blogPostData
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update blog post')
      }

      const updatedBlogPost = await response.json()
      setBlogPosts(prev =>
        prev.map(post =>
          post.id === id ? updatedBlogPost : post
        )
      )
      return updatedBlogPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blog post'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete blog post
  const deleteBlogPost = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete blog post')
      }

      setBlogPosts(prev => prev.filter(post => post.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog post'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Publish blog post
  const publishBlogPost = useCallback(async (id: string, publishDate?: string) => {
    setLoading(true)
    setError(null)

    try {
      const updateData = {
        published: true,
        ...(publishDate && { publishedAt: publishDate }),
      }

      const response = await fetch(`/api/blog-posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to publish blog post')
      }

      const publishedPost = await response.json()
      setBlogPosts(prev =>
        prev.map(post =>
          post.id === id ? publishedPost : post
        )
      )
      return publishedPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish blog post'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Unpublish blog post
  const unpublishBlogPost = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: false }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to unpublish blog post')
      }

      const unpublishedPost = await response.json()
      setBlogPosts(prev =>
        prev.map(post =>
          post.id === id ? unpublishedPost : post
        )
      )
      return unpublishedPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpublish blog post'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Duplicate blog post
  const duplicateBlogPost = useCallback(async (id: string, newTitle?: string) => {
    setLoading(true)
    setError(null)

    try {
      // First, get the original post
      const originalPost = await getBlogPost(id)
      
      // Create duplicate data
      const duplicateData: BlogPostCreateInput = {
        title: newTitle || `${originalPost.title} (Copy)`,
        slug: `${originalPost.slug}-copy-${Date.now()}`,
        excerpt: originalPost.excerpt,
        content: originalPost.content,
        hero: typeof originalPost.hero === 'object' ? originalPost.hero?.id : originalPost.hero,
        author: typeof originalPost.author === 'object' ? originalPost.author?.id : originalPost.author,
        category: originalPost.category,
        tags: originalPost.tags,
        readingTime: originalPost.readingTime,
        featured: false, // Don't duplicate featured status
        published: false, // Always create as draft
        seo: originalPost.seo,
      }

      const duplicatedPost = await createBlogPost(duplicateData)
      return duplicatedPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate blog post'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [getBlogPost, createBlogPost])

  // Like blog post (custom endpoint)
  const likeBlogPost = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/blog-posts/${id}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to like blog post')
      }

      const result = await response.json()

      // Update local state
      setBlogPosts(prev =>
        prev.map(post =>
          post.id === id
            ? { ...post, likeCount: (post.likeCount || 0) + 1 }
            : post
        )
      )

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like blog post'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Add comment (custom endpoint)
  const addComment = useCallback(async (postId: string, content: string, authorName?: string, authorEmail?: string) => {
    try {
      const response = await fetch(`/api/blog-posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, authorName, authorEmail }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to add comment')
      }

      const comment = await response.json()

      // Update local state
      setBlogPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, commentCount: (post.commentCount || 0) + 1 }
            : post
        )
      )

      return comment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Get comments (custom endpoint)
  const getComments = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/blog-posts/${postId}/comments`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch comments')
      }

      const comments = await response.json()
      return comments
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Bulk operations
  const bulkUpdateBlogPosts = useCallback(async (
    postIds: string[],
    operation: 'publish' | 'unpublish' | 'delete' | 'updateCategory' | 'addTags' | 'removeTags',
    data?: any
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/blog-posts/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          postIds,
          data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to perform bulk operation')
      }

      const result = await response.json()

      // Refresh the blog posts list
      await fetchBlogPosts()

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform bulk operation'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchBlogPosts])

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

      const response = await fetch(`/api/blog-posts/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch blog post analytics')
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

  // Initialize - fetch blog posts on mount
  useEffect(() => {
    fetchBlogPosts({ published: true, limit: 10 })
  }, [fetchBlogPosts])

  return {
    // State
    blogPosts,
    loading,
    error,
    analytics,
    pagination,

    // Actions
    fetchBlogPosts,
    getBlogPost,
    getBlogPostBySlug,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    publishBlogPost,
    unpublishBlogPost,
    duplicateBlogPost,
    likeBlogPost,
    addComment,
    getComments,
    bulkUpdateBlogPosts,
    fetchAnalytics,
    clearError,
  }
}

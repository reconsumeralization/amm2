'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

/**
 * Interface for business documentation document
 */
interface BusinessDocument {
  id: string
  title: string
  content: any
  category: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  author?: {
    name: string
    email: string
  }
  tags?: string[]
  description?: string
  version?: number
  readTime?: number
}

/**
 * Component to handle search params and document loading
 */
function PreviewContent() {
  const [doc, setDoc] = useState<BusinessDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [viewCount, setViewCount] = useState(0)
  const router = useRouter()

  // Get document ID from URL search params
  const getDocumentId = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('id')
    }
    return null
  }

  const id = getDocumentId()

  useEffect(() => {
    if (!id) {
      setError('No document ID provided')
      setLoading(false)
      return
    }

    const fetchDocument = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/business-documentation/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Document not found')
            return
          }
          throw new Error(`Failed to fetch document: ${response.statusText}`)
        }
        
        const docData = await response.json()
        setDoc(docData)
        setError(null)
        
        // Track view count
        await trackDocumentView(id)
        
        // Check bookmark status
        await checkBookmarkStatus(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        toast.error('Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  const trackDocumentView = async (documentId: string) => {
    try {
      const response = await fetch(`/api/business-documentation/${documentId}/view`, {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setViewCount(data.viewCount || 0)
      }
    } catch (err) {
      // Silent fail for analytics
      console.warn('Failed to track document view:', err)
    }
  }

  const checkBookmarkStatus = async (documentId: string) => {
    try {
      const response = await fetch(`/api/business-documentation/${documentId}/bookmark`)
      if (response.ok) {
        const data = await response.json()
        setIsBookmarked(data.isBookmarked || false)
      }
    } catch (err) {
      // Silent fail for bookmark check
      console.warn('Failed to check bookmark status:', err)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleEdit = () => {
    if (doc?.id) {
      router.push(`/portal/documentation/edit/${doc.id}`)
    }
  }

  const handleBookmark = async () => {
    if (!doc?.id) return

    try {
      const response = await fetch(`/api/business-documentation/${doc.id}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
      })

      if (response.ok) {
        setIsBookmarked(!isBookmarked)
        toast.success(isBookmarked ? 'Bookmark removed' : 'Document bookmarked')
      } else {
        throw new Error('Failed to update bookmark')
      }
    } catch (err) {
      toast.error('Failed to update bookmark')
    }
  }

  const handleShare = async () => {
    if (!doc) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: doc.title,
          text: doc.description || 'Business documentation',
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
      }
    } catch (err) {
      toast.error('Failed to share document')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const calculateReadTime = (content: any): number => {
    if (!content) return 0
    const text = typeof content === 'string' ? content : JSON.stringify(content)
    const wordsPerMinute = 200
    const wordCount = text.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-18" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <Icons.arrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            
            <Alert variant="destructive">
              <Icons.externalLink className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="text-center py-12">
              <Icons.database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Document Not Available</h2>
              <p className="text-gray-500 mb-6">The requested document could not be loaded.</p>
              <Button onClick={handleGoBack}>
                Return to Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <Icons.database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Document Not Found</h2>
            <p className="text-gray-500 mb-6">The requested document does not exist.</p>
            <Button onClick={handleGoBack}>
              <Icons.arrowLeft className="h-4 w-4 mr-2" />
              Return to Documentation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const readTime = doc.readTime || calculateReadTime(doc.content)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Enhanced header with navigation and actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <Icons.arrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(doc.status)}>
                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
              </Badge>
              
              {doc.version && (
                <Badge variant="outline">
                  v{doc.version}
                </Badge>
              )}
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBookmark}
                  className="flex items-center gap-1"
                >
                  <Icons.database className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-1"
                >
                  <Icons.externalLink className="h-4 w-4" />
                  Share
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-1"
                >
                  <Icons.settings className="h-4 w-4" />
                  Print
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Icons.edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced document preview card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <div className="space-y-4">
                <CardTitle className="text-3xl font-bold text-gray-800 leading-tight">
                  {doc.title}
                </CardTitle>
                
                {doc.description && (
                  <CardDescription className="text-lg text-gray-600 leading-relaxed">
                    {doc.description}
                  </CardDescription>
                )}
                
                {/* Enhanced metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Icons.calendar className="h-4 w-4" />
                    <span>
                      Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {doc.author && (
                    <div className="flex items-center gap-1">
                      <Icons.users className="h-4 w-4" />
                      <span>{doc.author.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Icons.database className="h-4 w-4" />
                    <span className="capitalize">{doc.category}</span>
                  </div>
                  
                  {readTime > 0 && (
                    <div className="flex items-center gap-1">
                      <Icons.clock className="h-4 w-4" />
                      <span>{readTime} min read</span>
                    </div>
                  )}
                  
                  {viewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Icons.settings className="h-4 w-4" />
                      <span>{viewCount} views</span>
                    </div>
                  )}
                </div>
                
                {/* Enhanced tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-800">
                {/* Enhanced content rendering */}
                {typeof doc.content === 'string' ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: doc.content }} 
                    className="document-content"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Raw Content:</h4>
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-600 overflow-x-auto">
                      {JSON.stringify(doc.content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Enhanced footer actions */}
          <div className="flex justify-center items-center gap-4 pt-6">
            <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
              <Icons.arrowLeft className="h-4 w-4" />
              Return to Documentation
            </Button>
            
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Icons.edit className="h-4 w-4" />
              Edit Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Preview page component for business documentation
 * Displays a document in preview mode with enhanced UI, error handling, and features
 */
export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Book, Code, FileText, ExternalLink, Star, TrendingUp, Users, Clock, ChevronRight, Sparkles } from '@/lib/icon-mapping'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RelatedContent, UserRole } from '@/types/documentation'

interface RelatedContentRecommendationsProps {
  relatedContent: RelatedContent[]
  userRole: UserRole
  currentGuideId: string
  maxRecommendations?: number
  showPersonalized?: boolean
  className?: string
}

export function RelatedContentRecommendations({
  relatedContent,
  userRole,
  currentGuideId,
  maxRecommendations = 6,
  showPersonalized = true,
  className = ''
}: RelatedContentRecommendationsProps) {
  const [personalizedContent, setPersonalizedContent] = useState<RelatedContent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch personalized recommendations based on user behavior
  useEffect(() => {
    if (showPersonalized) {
      fetchPersonalizedRecommendations()
    }
  }, [userRole, currentGuideId, showPersonalized])

  const fetchPersonalizedRecommendations = async () => {
    setIsLoading(true)
    try {
      // This would typically call an API that analyzes user behavior
      // For now, we'll simulate personalized recommendations
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate personalized content based on user role and behavior
      const mockPersonalized: RelatedContent[] = [
        {
          id: 'personalized-1',
          title: `${userRole === 'developer' ? 'Advanced API Integration' : 'Business Analytics Dashboard'}`,
          type: userRole === 'developer' ? 'api' : 'guide',
          url: `/documentation/${userRole === 'developer' ? 'developer/api' : 'business/analytics'}`,
          relevanceScore: 0.95
        },
        {
          id: 'personalized-2',
          title: `${userRole === 'salon_owner' ? 'Staff Management Best Practices' : 'Component Testing Strategies'}`,
          type: 'guide',
          url: `/documentation/${userRole === 'salon_owner' ? 'business/staff' : 'developer/testing'}`,
          relevanceScore: 0.88
        }
      ]
      
      setPersonalizedContent(mockPersonalized)
    } catch (error) {
      console.error('Failed to fetch personalized recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Combine and sort all recommendations
  const allRecommendations = [
    ...personalizedContent.map(content => ({ ...content, isPersonalized: true })),
    ...relatedContent.map(content => ({ ...content, isPersonalized: false }))
  ]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxRecommendations)

  // Get icon for content type
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return <BookOpen className="h-4 w-4" />
      case 'api':
        return <Code className="h-4 w-4" />
      case 'component':
        return <FileText className="h-4 w-4" />
      case 'reference':
        return <FileText className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  // Get color for content type
  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'guide':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'api':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'component':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'reference':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
    }
  }

  // Get relevance score color
  const getRelevanceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400'
    if (score >= 0.7) return 'text-yellow-400'
    if (score >= 0.5) return 'text-orange-400'
    return 'text-red-400'
  }

  if (allRecommendations.length === 0 && !isLoading) {
    return null
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          Related Content
        </CardTitle>
        <p className="text-sm text-slate-400">
          Recommended based on your role and current guide
        </p>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-700/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {allRecommendations.map((content) => (
              <RecommendationCard
                key={content.id}
                content={content}
                isPersonalized={content.isPersonalized}
                getContentTypeIcon={getContentTypeIcon}
                getContentTypeColor={getContentTypeColor}
                getRelevanceColor={getRelevanceColor}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        {relatedContent.length > maxRecommendations && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/documentation/rch">
                View All Related Content
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Individual Recommendation Card Component
interface RecommendationCardProps {
  content: RelatedContent & { isPersonalized?: boolean }
  isPersonalized?: boolean
  getContentTypeIcon: (type: string) => React.ReactNode
  getContentTypeColor: (type: string) => string
  getRelevanceColor: (score: number) => string
}

function RecommendationCard({
  content,
  isPersonalized = false,
  getContentTypeIcon,
  getContentTypeColor,
  getRelevanceColor
}: RecommendationCardProps) {
  const isExternal = content.url.startsWith('http')

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isExternal) {
      return (
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {children}
        </a>
      )
    }
    
    return (
      <Link href={content.url} className="block">
        {children}
      </Link>
    )
  }

  return (
    <CardWrapper>
      <div className="p-3 rounded-lg border border-slate-600/50 hover:border-slate-500/70 transition-all hover:bg-slate-800/30 group">
        <div className="flex items-start gap-3">
          {/* Content Type Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${getContentTypeColor(content.type)}`}>
            {getContentTypeIcon(content.type)}
          </div>

          {/* Content Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                  {content.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs capitalize ${getContentTypeColor(content.type)}`}
                  >
                    {content.type}
                  </Badge>
                  {isPersonalized && (
                    <Badge variant="outline" className="text-xs text-cyan-400 bg-cyan-500/20 border-cyan-500/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      For You
                    </Badge>
                  )}
                </div>
              </div>

              {/* Relevance Score and External Link Indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className={`h-3 w-3 ${getRelevanceColor(content.relevanceScore)}`} />
                  <span className={`text-xs ${getRelevanceColor(content.relevanceScore)}`}>
                    {Math.round(content.relevanceScore * 100)}%
                  </span>
                </div>
                {isExternal && (
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                )}
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}

// Smart Recommendations Component (for advanced use cases)
interface SmartRecommendationsProps {
  userRole: UserRole
  currentGuideId: string
  userBehavior?: {
    viewedContent: string[]
    completedGuides: string[]
    rchQueries: string[]
    timeSpentByCategory: Record<string, number>
  }
  className?: string
}

export function SmartRecommendations({
  userRole,
  currentGuideId,
  userBehavior,
  className = ''
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RelatedContent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateSmartRecommendations()
  }, [userRole, currentGuideId, userBehavior])

  const generateSmartRecommendations = async () => {
    setIsLoading(true)
    try {
      // This would use ML/AI to generate personalized recommendations
      // For now, we'll simulate smart recommendations
      await new Promise(resolve => setTimeout(resolve, 1500))

      const smartRecommendations: RelatedContent[] = [
        {
          id: 'smart-1',
          title: 'Trending in Your Role',
          type: 'guide',
          url: `/documentation/${userRole}/trending`,
          relevanceScore: 0.92
        },
        {
          id: 'smart-2',
          title: 'Similar Users Also Viewed',
          type: 'reference',
          url: `/documentation/popular`,
          relevanceScore: 0.85
        },
        {
          id: 'smart-3',
          title: 'Complete Your Learning Path',
          type: 'guide',
          url: `/documentation/${userRole}/learning-path`,
          relevanceScore: 0.78
        }
      ]

      setRecommendations(smartRecommendations)
    } catch (error) {
      console.error('Failed to generate smart recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          Smart Recommendations
        </CardTitle>
        <p className="text-sm text-slate-400">
          AI-powered suggestions based on your learning patterns
        </p>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-slate-700/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                href={rec.url}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors group"
              >
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm text-slate-200 group-hover:text-purple-400 transition-colors">
                  {rec.title}
                </span>
                <ChevronRight className="h-3 w-3 text-slate-400 ml-auto group-hover:text-purple-400 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Search, ExternalLink, Clock, User, Tag, Star, Book, Code, Cog, BookOpen, Settings, FileText   } from '@/lib/icon-mapping'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string  
  title: string
  content: string
  description?: string
  type: 'component' | 'guide' | 'api' | 'reference'
  score: number
  relevanceScore?: number
  url: string
  highlights: string[]
  tags: string[]
  category?: string
  metadata?: {
    author?: string
    date?: string
    version?: string
  }
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  isLoading?: boolean
  onResultClick?: (result: SearchResult) => void
}

const getTypeIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'component':
      return <Code className="h-4 w-4" />
    case 'guide':
      return <BookOpen className="h-4 w-4" />
    case 'api':
      return <Settings className="h-4 w-4" />
    case 'reference':
      return <FileText className="h-4 w-4" />
    default:
      return <Search className="h-4 w-4" />
  }
}

const getTypeColor = (type: SearchResult['type']) => {
  switch (type) {
    case 'component':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'guide':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'api':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'reference':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getRelevanceColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export function SearchResults({
  results,
  query,
  isLoading = false,
  onResultClick
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any documentation matching "{query}"
          </p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Try rching for:</p>
            <ul className="text-left max-w-md mx-auto space-y-1">
              <li>• Component names (e.g., "Button", "Input")</li>
              <li>• Categories (e.g., "UI", "Layout", "Charts")</li>
              <li>• Features (e.g., "accessibility", "responsive")</li>
              <li>• Keywords (e.g., "styling", "validation")</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* rch Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Sorted by relevance</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <Card
            key={result.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onResultClick?.(result)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    'p-2 rounded-lg border',
                    getTypeColor(result.type)
                  )}>
                    {getTypeIcon(result.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={result.url}
                      className="block hover:underline"
                      onClick={(e) => {
                        onResultClick?.(result)
                        // Let the link navigate normally
                      }}
                    >
                      <h3 className="font-semibold text-lg truncate">
                        {result.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {result.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <Star className={cn(
                          'h-3 w-3',
                          getRelevanceColor(result.relevanceScore || 0)
                        )} />
                        <span className="text-xs">
                          {Math.round(result.relevanceScore || 0)}% relevant
                        </span>
                      </div>


                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="sm" asChild>
                  <Link href={result.url}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {result.description}
              </p>

              {/* Highlights */}
              {result.highlights && result.highlights.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Found in:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.highlights.map((highlight, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {result.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {result.tags.slice(0, 5).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {result.tags.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{result.tags.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  {result.metadata?.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{result.metadata.author}</span>
                    </div>
                  )}

                  {result.metadata?.date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{result.metadata.date}</span>
                    </div>
                  )}

                  {result.metadata?.version && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{result.metadata.version}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      'text-xs',
                      getTypeColor(result.type)
                    )}
                  >
                    {result.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {results.length >= 20 && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Load More Results
          </Button>
        </div>
      )}
    </div>
  )
}

// Compact version for smaller spaces
export function SearchResultsCompact({
  results,
  onResultClick = () => {}  ,
  query = ''
}: SearchResultsProps) {
  return (
    <div className="space-y-2">
      {results.map((result) => (
        <div
          key={result.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
          onClick={() => onResultClick?.(result)}
        >
          <div className={cn('p-1.5 rounded', getTypeColor(result.type))}>
            {getTypeIcon(result.type)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{result.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {result.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {result.category}
            </Badge>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Search, Filter, X } from '@/lib/icon-mapping'

interface DocumentationSearchPageProps {
  initialQuery?: string
  initialCategory?: string
  initialType?: string
  showFilters?: boolean
  compact?: boolean
}

interface SearchResult {
  id: string
  title: string
  content: string
  category: string
  type: string
  url: string
  tags?: string[]
}

export function DocumentationSearchPage({
  initialQuery = '',
  initialCategory = '',
  initialType = '',
  showFilters = true,
  compact = false
}: DocumentationSearchPageProps) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [type, setType] = useState(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = ['guides', 'api', 'tutorials', 'reference', 'faq']
  const types = ['article', 'video', 'code-example', 'interactive']

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams({
        q: query,
        ...(category && { category }),
        ...(type && { type })
      })

      const response = await fetch(`/api/documentation/search?${searchParams}`)

      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to perform search. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [query, category, type])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [performSearch])

  const clearFilters = () => {
    setCategory('')
    setType('')
  }

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text

    const regex = new RegExp(`(${highlight})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 ${compact ? 'py-8' : 'py-16'}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Documentation Search
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find answers, guides, and resources across our documentation
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Types</option>
                  {types.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}</option>
                  ))}
                </select>
              </div>

              {(category || type) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-12">
              <Icons.spinner className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
              <p className="text-gray-600">Searching...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <Icons.alertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && query.trim() && (
            <div className="text-center py-12">
            <Icons.search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}

          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      <a href={result.url} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {highlightText(result.title, query)}
                      </a>
                    </CardTitle>
                    <CardDescription className="mb-3">
                      {highlightText(result.content, query)}
                    </CardDescription>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {result.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                      {result.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {!loading && !error && results.length > 0 && (
            <div className="text-center text-gray-600">
              <p>Found {results.length} result{results.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

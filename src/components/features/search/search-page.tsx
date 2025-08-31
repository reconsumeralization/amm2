'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Clock, Users, Target, Zap, Search, Filter, Star, Calendar, MapPin, BookOpen, Scissors, Brush, X, ArrowRight, Sparkles, History } from '@/lib/icon-mapping'
import { useMonitoring } from '@/hooks/useMonitoring'
import { useBreadcrumbTracking } from '@/hooks/useMonitoring'
import { searchService, SearchResult } from '@/lib/search-service'

// Custom Search icon (inline SVG, styled to match lucide-react)
export const LucideSearch: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

interface SearchPageProps {
  initialQuery?: string
  showStats?: boolean
}

interface SearchHistory {
  query: string
  timestamp: Date
  resultCount: number
}

export function SearchPage({ initialQuery = '', showStats = true }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'popularity'>('relevance')
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    averageResponseTime: 0,
    noResultsRate: 0,
    popularQueries: [] as string[]
  })

  const { trackPageView } = useMonitoring()
  const { addBreadcrumb } = useBreadcrumbTracking()

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setSearchHistory(parsed)
      } catch (error) {
        console.error('Failed to parse search history:', error)
      }
    }
  }, [])

  // Save search history to localStorage
  const saveSearchHistory = useCallback((newHistory: SearchHistory[]) => {
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }, [])

  useEffect(() => {
    trackPageView('/search', { initialQuery })
    addBreadcrumb('search page loaded', { category: 'navigation', level: 'info' })
  }, [trackPageView, addBreadcrumb, initialQuery])

  // Debounced search suggestions
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    // Mock suggestions - in real app, this would be an API call
    const mockSuggestions = [
      'haircut for men',
      'beard trimming',
      'hair styling',
      'appointment booking',
      'barber services',
      'hair wash',
      'mustache grooming'
    ].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))

    setSuggestions(mockSuggestions.slice(0, 5))
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query && !isLoading) {
        getSuggestions(query)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, getSuggestions, isLoading])

  const handleSearch = async (searchQuery: string, addToHistory = true) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setQuery(searchQuery)
    setShowSuggestions(false)
    setShowHistory(false)

    try {
      const searchResult = await searchService.search(
        {
          query: searchQuery,
          pagination: { page: 1, limit: 20 },
          filters: selectedFilters.length > 0 ? { types: selectedFilters } : undefined,
          sortBy
        },
        'guest'
      )

      let sortedResults = [...searchResult.results]
      
      // Apply sorting
      if (sortBy === 'date') {
        sortedResults.sort((a, b) => new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime())
      } else if (sortBy === 'popularity') {
        sortedResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      }

      setResults(sortedResults)

      // Add to search history
      if (addToHistory) {
        const newHistoryItem: SearchHistory = {
          query: searchQuery,
          timestamp: new Date(),
          resultCount: searchResult.totalCount
        }
        
        const updatedHistory = [newHistoryItem, ...searchHistory.filter(h => h.query !== searchQuery)].slice(0, 10)
        setSearchHistory(updatedHistory)
        saveSearchHistory(updatedHistory)
      }

      // Update search stats
      setSearchStats(prev => ({
        ...prev,
        totalSearches: prev.totalSearches + 1,
        averageResponseTime: searchResult.executionTime,
        noResultsRate: searchResult.totalCount === 0 ? 100 : 0,
        popularQueries: [...new Set([searchQuery, ...prev.popularQueries])].slice(0, 5)
      }))
    } catch (error) {
      console.error('search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    addBreadcrumb(`Clicked search result: ${result.title}`, { category: 'interaction', level: 'info' })

    // Track result click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search_result_click', {
        event_category: 'search',
        event_label: result.title,
        value: result.relevanceScore
      })
    }
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  // Memoized filter options
  const filterOptions = useMemo(() => [
    { value: 'service', label: 'Services', icon: Star, color: 'blue' },
    { value: 'stylist', label: 'Stylists', icon: Users, color: 'green' },
    { value: 'page', label: 'Pages', icon: BookOpen, color: 'purple' },
    { value: 'booking', label: 'Booking', icon: Calendar, color: 'orange' }
  ], [])

  // Enhanced search input with autocomplete
  const SearchInput = () => (
    <div className="relative">
      <div className="relative">
        <LucideSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for services, stylists, documentation, or anything else..."
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => {
            if (query.length > 0) setShowSuggestions(true)
            if (searchHistory.length > 0 && !query) setShowHistory(true)
          }}
          onBlur={() => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => {
              setShowSuggestions(false)
              setShowHistory(false)
            }, 200)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query)
            } else if (e.key === 'Escape') {
              setShowSuggestions(false)
              setShowHistory(false)
            }
          }}
          className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Search input"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('')
                setResults([])
                setShowSuggestions(false)
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => handleSearch(query)}
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Search"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LucideSearch className="h-4 w-4" />
                  Search
                </div>
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {(showSuggestions && suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => {
                  setQuery(suggestion)
                  handleSearch(suggestion)
                }}
              >
                <LucideSearch className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{suggestion}</span>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search History Dropdown */}
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Recent Searches</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearchHistory}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
            </div>
            {searchHistory.slice(0, 5).map((item, index) => (
              <motion.div
                key={`${item.query}-${item.timestamp.getTime()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => {
                  setQuery(item.query)
                  handleSearch(item.query, false)
                }}
              >
                <Clock className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <span className="text-gray-700">{item.query}</span>
                  <div className="text-xs text-gray-500">
                    {item.resultCount} results • {item.timestamp.toLocaleDateString()}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 text-sm font-medium mb-4 border-0"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            🔍 Advanced Search
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Find What You <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">Need</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Search through our services, stylists, documentation, and more with intelligent suggestions and advanced filtering.
          </p>
        </motion.div>

        {/* Enhanced Search Input */}
        <motion.div 
          className="max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SearchInput />
        </motion.div>

        {/* Advanced Filters */}
        <motion.div 
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <motion.div
                  key={filter.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedFilters.includes(filter.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter(filter.value)}
                    className={`transition-all duration-300 ${
                      selectedFilters.includes(filter.value)
                        ? `bg-${filter.color}-500 hover:bg-${filter.color}-600 text-white`
                        : `border-${filter.color}-200 text-${filter.color}-600 hover:bg-${filter.color}-50`
                    }`}
                  >
                    <filter.icon className="h-3 w-3 mr-1" />
                    {filter.label}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>

            {/* Clear Filters */}
            {selectedFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFilters([])}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </motion.div>

        {/* Enhanced Stats Dashboard */}
        {showStats && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {[
              { label: 'Total Searches', value: searchStats.totalSearches, color: 'blue', icon: Search, trend: '+12%' },
              { label: 'Avg Response', value: `${Math.round(searchStats.averageResponseTime)}ms`, color: 'green', icon: Zap, trend: '-5ms' },
              { label: 'Success Rate', value: `${Math.round(100 - searchStats.noResultsRate)}%`, color: 'purple', icon: Target, trend: '+3%' },
              { label: 'Current Results', value: results.length, color: 'orange', icon: TrendingUp, trend: query ? 'Live' : 'Ready' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-3xl font-bold text-${stat.color}-600 mb-1 group-hover:scale-110 transition-transform`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.trend}</div>
                      </div>
                      <div className={`p-3 rounded-full bg-${stat.color}-100 group-hover:bg-${stat.color}-200 transition-colors`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Enhanced Search Results */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {query && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Search Results for &quot;{query}&quot;
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {results.length} results
                  </Badge>
                  {selectedFilters.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {selectedFilters.length} filter{selectedFilters.length > 1 ? 's' : ''} applied
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Loading State */}
          {isLoading && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-amber-400 rounded-full animate-spin"
                    style={{ animationDelay: '0.5s' }}
                  ></div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900 mb-2">Searching...</p>
                  <p className="text-gray-600">Finding the best results for you</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-amber-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Results Display */}
          {!isLoading && results.length > 0 && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <AnimatePresence>
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    layout
                  >
                    <Card
                      className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm group hover:scale-[1.02]"
                      onClick={() => handleResultClick(result)}
                      tabIndex={0}
                      aria-label={`View details for ${result.title}`}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') handleResultClick(result)
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                                {result.title}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={`text-xs font-medium ${
                                  result.type === 'service' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                  result.type === 'stylist' ? 'border-green-200 text-green-700 bg-green-50' :
                                  'border-purple-200 text-purple-700 bg-purple-50'
                                }`}
                              >
                                {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                              </Badge>
                              {result.isNew && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-4 leading-relaxed">{result.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline" className="text-xs">
                                {result.category}
                              </Badge>
                              {result.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                                  {tag}
                                </Badge>
                              ))}
                              {result.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                  +{result.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span>Score: {result.relevanceScore}</span>
                              </div>
                              {result.type === 'service' && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Book Now</span>
                                </div>
                              )}
                              {result.lastModified && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Updated {new Date(result.lastModified).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-6 flex flex-col gap-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-amber-200 text-amber-600 hover:bg-amber-50 group-hover:border-amber-300"
                              >
                                View Details
                                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </motion.div>
                            {result.type === 'service' && (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button 
                                  size="sm"
                                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl"
                                >
                                  Book Now
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Enhanced No Results State */}
          {!isLoading && query && results.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No results found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't find anything matching "{query}". Try adjusting your search terms or browse our categories below.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => setQuery('')} variant="outline" size="lg">
                    Clear Search
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => setSelectedFilters([])}
                    variant="outline" 
                    size="lg"
                    disabled={selectedFilters.length === 0}
                  >
                    Clear Filters
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600">
                    Browse All Services
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Search Tips */}
        {!query && !isLoading && (
          <motion.div 
            className="max-w-4xl mx-auto mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <div className="p-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100">
                    <LucideSearch className="h-6 w-6 text-amber-600" />
                  </div>
                  Search Tips & Categories
                </CardTitle>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover how to find exactly what you're looking for with our powerful search features and intelligent suggestions
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Search by Type */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Search by Type</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { type: 'service', description: 'Find BarberShop services', icon: Star },
                        { type: 'stylist', description: 'Find team members', icon: Users },
                        { type: 'page', description: 'Find general pages', icon: BookOpen }
                      ].map((item) => (
                        <motion.div
                          key={item.type}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                          whileHover={{ x: 5 }}
                          onClick={() => setQuery(item.type)}
                        >
                          <item.icon className="h-4 w-4 text-gray-500 group-hover:text-amber-600 transition-colors" />
                          <Badge variant="outline" className="text-xs group-hover:border-amber-200 group-hover:text-amber-600">
                            {item.type}
                          </Badge>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900">{item.description}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Search by Category */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-full bg-green-100">
                        <Filter className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Search by Category</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { category: 'haircut', description: 'Hair cutting services', icon: Scissors },
                        { category: 'beard', description: 'Beard grooming services', icon: Brush },
                        { category: 'booking', description: 'Appointment booking', icon: Calendar }
                      ].map((item) => (
                        <motion.div
                          key={item.category}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                          whileHover={{ x: 5 }}
                          onClick={() => setQuery(item.category)}
                        >
                          <item.icon className="h-4 w-4 text-gray-500 group-hover:text-green-600 transition-colors" />
                          <Badge variant="outline" className="text-xs group-hover:border-green-200 group-hover:text-green-600">
                            {item.category}
                          </Badge>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900">{item.description}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Searches */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-full bg-purple-100">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Popular Searches</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { term: 'men haircut', description: 'Classic men\'s cuts', icon: Scissors },
                        { term: 'beard trim', description: 'Beard grooming', icon: Brush },
                        { term: 'appointment', description: 'Book your visit', icon: Calendar }
                      ].map((item) => (
                        <motion.div
                          key={item.term}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                          whileHover={{ x: 5 }}
                          onClick={() => setQuery(item.term)}
                        >
                          <item.icon className="h-4 w-4 text-gray-500 group-hover:text-purple-600 transition-colors" />
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 group-hover:bg-purple-100 group-hover:text-purple-800">
                            {item.term}
                          </Badge>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900">{item.description}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {[
                      { label: 'Browse Services', action: () => setQuery('service'), icon: Star, color: 'blue' },
                      { label: 'Meet Our Team', action: () => setQuery('stylist'), icon: Users, color: 'green' },
                      { label: 'Book Appointment', action: () => setQuery('booking'), icon: Calendar, color: 'orange' },
                      { label: 'View Location', action: () => setQuery('location'), icon: MapPin, color: 'purple' }
                    ].map((action) => (
                      <motion.div
                        key={action.label}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={action.action}
                          className={`border-${action.color}-200 text-${action.color}-600 hover:bg-${action.color}-50 hover:border-${action.color}-300 transition-all duration-300 shadow-md hover:shadow-lg`}
                        >
                          <action.icon className="h-4 w-4 mr-2" />
                          {action.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Clock, Users, Target, Zap, Search, Filter, Star, Calendar, MapPin, BookOpen, Scissors, Brush } from '@/lib/icon-mapping'
import { useMonitoring } from '@/hooks/useMonitoring'
import { searchService, SearchResult } from '@/lib/search-service'
// --- FIX: Use correct import for Search icon from lucide-react ---
// The 'Search' icon may not be available in some versions of lucide-react.
// To avoid runtime errors, use a fallback icon if not present.
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

export function SearchPage({ initialQuery = '', showStats = true }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    averageResponseTime: 0,
    noResultsRate: 0
  })

  const { trackPageView, addBreadcrumb } = useMonitoring()

  useEffect(() => {
    trackPageView('/search', { initialQuery })
    addBreadcrumb('search page loaded', 'navigation', 'info')
  }, [trackPageView, addBreadcrumb, initialQuery])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setQuery(searchQuery)

    try {
      const searchResult = await searchService.search(
        {
          query: searchQuery,
          pagination: { page: 1, limit: 20 }
        },
        'guest'
      )

      setResults(searchResult.results)

      // Update search stats
      setSearchStats(prev => ({
        ...prev,
        totalSearches: prev.totalSearches + 1,
        averageResponseTime: searchResult.executionTime,
        noResultsRate: searchResult.totalCount === 0 ? 100 : 0
      }))
    } catch (error) {
      console.error('search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    addBreadcrumb(`Clicked search result: ${result.title}`, 'interaction', 'info')

    // Track result click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search_result_click', {
        event_category: 'search',
        event_label: result.title,
        value: result.relevanceScore
      })
    }
  }

  // Helper: Render the Search icon, fallback to a simple SVG if not available
  const SearchIcon = (props: React.ComponentProps<'svg'>) =>
    LucideSearch ? (
      <LucideSearch {...props} />
    ) : (
      <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge 
            variant="secondary" 
            className="bg-amber-100 text-amber-800 px-4 py-2 text-sm font-medium mb-4"
          >
            🔍 Search Everything
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Find What You <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">Need</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Search through our services, stylists, documentation, and more to find exactly what you're looking for.
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div 
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for services, stylists, documentation, or anything else..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch(query)
                }}
                className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="Search input"
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
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
                      <Search className="h-4 w-4" />
                      Search
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Services', 'Stylists', 'Documentation', 'Booking'].map((filter) => (
                <motion.div
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(filter.toLowerCase())}
                    className="border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all duration-300"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    {filter}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        {showStats && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {[
              { label: 'Total Searches', value: searchStats.totalSearches, color: 'blue', icon: Search },
              { label: 'Avg Response', value: `${Math.round(searchStats.averageResponseTime)}ms`, color: 'green', icon: Zap },
              { label: 'Success Rate', value: `${Math.round(100 - searchStats.noResultsRate)}%`, color: 'purple', icon: Target },
              { label: 'Current Results', value: results.length, color: 'orange', icon: TrendingUp }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                      </div>
                      <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Search Results */}
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
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Search Results for &quot;{query}&quot;
                </h2>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {results.length} results
                </Badge>
              </div>
            </motion.div>
          )}

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
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-amber-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900 mb-2">Searching...</p>
                  <p className="text-gray-600">Finding the best results for you</p>
                </div>
              </div>
            </motion.div>
          )}

          {!isLoading && results.length > 0 && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm group"
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
                              className="border-amber-200 text-amber-600 hover:bg-amber-50"
                            >
                              View Details
                            </Button>
                          </motion.div>
                          {result.type === 'service' && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                size="sm"
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
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
            </motion.div>
          )}

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
              <div className="flex gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => setQuery('')} variant="outline" size="lg">
                    Clear Search
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

        {/* Search Tips */}
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
                  <div className="p-2 rounded-full bg-amber-100">
                    <Search className="h-6 w-6 text-amber-600" />
                  </div>
                  Search Tips & Categories
                </CardTitle>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover how to find exactly what you're looking for with our powerful search features
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
                        { type: 'service', description: 'Find salon services', icon: Star },
                        { type: 'stylist', description: 'Find team members', icon: Users },
                        { type: 'page', description: 'Find general pages', icon: BookOpen }
                      ].map((item) => (
                        <motion.div
                          key={item.type}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                          onClick={() => setQuery(item.type)}
                        >
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <span className="text-sm text-gray-600">{item.description}</span>
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
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                          onClick={() => setQuery(item.category)}
                        >
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-sm text-gray-600">{item.description}</span>
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
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                          onClick={() => setQuery(item.term)}
                        >
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                            {item.term}
                          </Badge>
                          <span className="text-sm text-gray-600">{item.description}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {[
                      { label: 'Browse Services', action: () => setQuery('service'), icon: Star },
                      { label: 'Meet Our Team', action: () => setQuery('stylist'), icon: Users },
                      { label: 'Book Appointment', action: () => setQuery('booking'), icon: Calendar },
                      { label: 'View Location', action: () => setQuery('location'), icon: MapPin }
                    ].map((action) => (
                      <motion.div
                        key={action.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={action.action}
                          className="border-amber-200 text-amber-600 hover:bg-amber-50"
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

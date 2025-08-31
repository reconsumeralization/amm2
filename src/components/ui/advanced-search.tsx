"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Search, X, Clock, TrendingUp } from '@/lib/icon-mapping'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'post' | 'user' | 'category'
  url: string
  image?: string
}

interface SearchProps {
  onSelect?: (result: SearchResult) => void
  placeholder?: string
  className?: string
}

export function AdvancedSearch({ onSelect, placeholder = "search...", className }: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState(['Next.js', 'React', 'TypeScript', 'Tailwind CSS'])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const loadRecentSearches = () => {
      const saved = localStorage.getItem('recent-searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    }
    loadRecentSearches()
  }, [])

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      performSearch(debouncedQuery)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [debouncedQuery])
  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error('search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (result: SearchResult) => {
    const newRecentSearches = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5)
    setRecentSearches(newRecentSearches)
    localStorage.setItem('recent-searches', JSON.stringify(newRecentSearches))

    setQuery('')
    setIsOpen(false)
    onSelect?.(result)
  }

  const handleRecentSearch = (search: string) => {
    setQuery(search)
    inputRef.current?.focus()
  }

  const clearQuery = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-lg", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-input bg-background px-10 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-popover p-1 shadow-lg"
          >
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="max-h-80 overflow-auto">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-center gap-3 rounded-md p-3 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {result.image && (
                      <Image src={result.image} alt="" width={32} height={32} className="h-8 w-8 rounded object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      <div className="text-muted-foreground truncate">{result.description}</div>
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && query.length <= 2 && (
              <div className="p-2">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Recent searches
                    </div>
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleRecentSearch(search)}
                        className="block w-full rounded p-2 text-left text-sm hover:bg-accent"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Popular searches
                  </div>
                  {popularSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleRecentSearch(search)}
                      className="block w-full rounded p-2 text-left text-sm hover:bg-accent"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && results.length === 0 && query.length > 2 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

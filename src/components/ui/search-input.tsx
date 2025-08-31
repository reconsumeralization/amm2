'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from './input'
import { Button } from './button'
import { Search, X, Filter, Loader2 } from '@/lib/icon-mapping'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { SearchFilterPanel } from './search-filter-panel'

interface SearchInputProps {
  placeholder?: string
  className?: string
  showFilters?: boolean
  isLoading?: boolean
  initialQuery?: string
}

export function SearchInput({
  placeholder = 'search documentation...',
  className,
  showFilters = true,
  isLoading = false,
  initialQuery = ''
}: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState({
    category: [] as string[],
    type: [] as string[],
    difficulty: [] as string[],
    tags: [] as string[]
  })

  const debouncedQuery = useDebounce(query, 300);
  const debouncedFilters = useDebounce(filters, 300);

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('q', debouncedQuery);

    Object.entries(debouncedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });

    router.push(`/documentation/search?${params.toString()}`);

  }, [debouncedQuery, debouncedFilters, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams();
    params.set('q', query);
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });
    router.push(`/documentation/search?${params.toString()}`);
  }

  const clearSearch = () => {
    setQuery('')
    clearFilters()
    inputRef.current?.focus()
  }

  const clearFilters = () => {
    setFilters({
      category: [],
      type: [],
      difficulty: [],
      tags: []
    })
  }

  const toggleFilter = (filterType: string, value: string) => {
    setFilters(prev => {
      const current = prev[filterType as keyof typeof prev] as string[]
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]

      return {
        ...prev,
        [filterType]: updated
      }
    })
  }

  const activeFilterCount = Object.values(filters).reduce(
    (count, arr) => count + arr.length, 0
  )

  return (
    <div className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-20 h-12 text-base"
            disabled={isLoading}
          />
          <div className="absolute right-2 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {showFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={cn(
                  'h-8 w-8 p-0',
                  activeFilterCount > 0 && 'text-primary'
                )}
              >
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      {showFilterPanel && showFilters && (
        <SearchFilterPanel 
          filters={filters} 
          toggleFilter={toggleFilter} 
          clearFilters={clearFilters}
          onApply={() => setShowFilterPanel(false)}
        />
      )}
    </div>
  )
}

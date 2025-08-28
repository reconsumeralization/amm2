'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from './input'
import { Button } from './button'
import { rch, X, Filter, Loader2 } from '@/lib/icon-mapping'
import { cn } from '@/lib/utils'
import { useMonitoring } from '@/hooks/useMonitoring'

interface rchInputProps {
  onrch: (query: string, filters?: any) => void
  placeholder?: string
  className?: string
  showFilters?: boolean
  isLoading?: boolean
  initialQuery?: string
}

export function rchInput({
  onrch,
  placeholder = 'rch documentation...',
  className,
  showFilters = true,
  isLoading = false,
  initialQuery = ''
}: rchInputProps) {
  const [query, setQuery] = useState(initialQuery)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState({
    category: [] as string[],
    type: [] as string[],
    difficulty: [] as string[],
    tags: [] as string[]
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const { trackrch } = useMonitoring()

  // Debounce rch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        onrch(query, filters)
        trackrch(query, 0) // Will be updated with actual results count
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, filters, onrch, trackrch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onrch(query, filters)
      trackrch(query, 0)
    }
  }

  const clearrch = () => {
    setQuery('')
    setFilters({
      category: [],
      type: [],
      difficulty: [],
      tags: []
    })
    inputRef.current?.focus()
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
          <rch className="absolute left-3 h-4 w-4 text-muted-foreground" />
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
                onClick={clearrch}
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

      {/* Filter Panel */}
      {showFilterPanel && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="space-y-1">
                {['ui', 'layout', 'charts', 'admin', 'documentation'].map(category => (
                  <label key={category} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={() => toggleFilter('category', category)}
                      className="rounded"
                    />
                    <span className="capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <div className="space-y-1">
                {['component', 'guide', 'api', 'reference'].map(type => (
                  <label key={type} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={() => toggleFilter('type', type)}
                      className="rounded"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <div className="space-y-1">
                {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                  <label key={difficulty} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.difficulty.includes(difficulty)}
                      onChange={() => toggleFilter('difficulty', difficulty)}
                      className="rounded"
                    />
                    <span className="capitalize">{difficulty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="space-y-1">
                {['accessibility', 'example', 'required', 'interactive'].map(tag => (
                  <label key={tag} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={() => toggleFilter('tags', tag)}
                      className="rounded"
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearrch}
            >
              Clear All Filters
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowFilterPanel(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

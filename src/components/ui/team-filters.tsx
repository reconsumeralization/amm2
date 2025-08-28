'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import { motion } from 'framer-motion'

interface FilterOptions {
  specializations: string[]
  experience: string[]
  rating: string[]
  price: string[]
}

interface TeamFiltersProps {
  onFilterChange: (filters: {
    specialization?: string
    minExperience?: number
    minRating?: number
    maxPrice?: number
    sortBy?: string
  }) => void
  availableSpecializations: string[]
  className?: string
}

export function TeamFilters({
  onFilterChange,
  availableSpecializations,
  className = ''
}: TeamFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{
    specialization?: string
    minExperience?: number
    minRating?: number
    maxPrice?: number
    sortBy?: string
  }>({})

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    const newFilters = { ...activeFilters, [key]: value }
    if (value === '' || value === undefined) {
      delete newFilters[key as keyof typeof newFilters]
    }
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setActiveFilters({})
    onFilterChange({})
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <Card className={`mb-6 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icons.settings className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Filter Team Members</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? <Icons.x className="h-4 w-4" /> : <Icons.info className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={isExpanded ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
            {/* Specialization Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Specialization</label>
              <Select
                value={activeFilters.specialization || ''}
                onValueChange={(value) => handleFilterChange('specialization', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {availableSpecializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Min Experience</label>
              <Select
                value={activeFilters.minExperience?.toString() || ''}
                onValueChange={(value) => handleFilterChange('minExperience', value === 'any' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Experience</SelectItem>
                  <SelectItem value="0">New (0+ years)</SelectItem>
                  <SelectItem value="2">2+ years</SelectItem>
                  <SelectItem value="5">5+ years</SelectItem>
                  <SelectItem value="10">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Min Rating</label>
              <Select
                value={activeFilters.minRating?.toString() || ''}
                onValueChange={(value) => handleFilterChange('minRating', value === 'any' ? undefined : parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="4.0">4.0+ stars</SelectItem>
                  <SelectItem value="3.5">3.5+ stars</SelectItem>
                  <SelectItem value="3.0">3.0+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Price</label>
              <Select
                value={activeFilters.maxPrice?.toString() || ''}
                onValueChange={(value) => handleFilterChange('maxPrice', value === 'any' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="50">$50 or less</SelectItem>
                  <SelectItem value="75">$75 or less</SelectItem>
                  <SelectItem value="100">$100 or less</SelectItem>
                  <SelectItem value="150">$150 or less</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <Select
                value={activeFilters.sortBy || 'name'}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="appointments">Most Booked</SelectItem>
                  <SelectItem value="displayOrder">Featured First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mt-4 pt-4 border-t"
          >
            {Object.entries(activeFilters).map(([key, value]) => {
              if (value === undefined || value === '') return null

              let displayText = ''
              let displayValue = ''

              switch (key) {
                case 'specialization':
                  displayText = 'Specialization'
                  displayValue = value as string
                  break
                case 'minExperience':
                  displayText = 'Experience'
                  displayValue = `${value}+ years`
                  break
                case 'minRating':
                  displayText = 'Rating'
                  displayValue = `${value}+ stars`
                  break
                case 'maxPrice':
                  displayText = 'Price'
                  displayValue = `≤ $${value}`
                  break
                case 'sortBy':
                  displayText = 'Sort'
                  displayValue = value as string
                  break
              }

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 flex items-center space-x-1"
                >
                  <span>{displayText}: {displayValue}</span>
                  <button
                    onClick={() => handleFilterChange(key, undefined)}
                    className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                  >
                    <Icons.x className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

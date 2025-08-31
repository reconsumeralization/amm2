'use client'

import React from 'react'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Label } from './label'

interface SearchFilterPanelProps {
  filters: {
    category: string[],
    type: string[],
    difficulty: string[],
    tags: string[],
  }
  toggleFilter: (filterType: string, value: string) => void
  clearFilters: () => void
  onApply: () => void
}

const filterOptions = {
  category: ['ui', 'layout', 'charts', 'admin', 'documentation'],
  type: ['component', 'guide', 'api', 'reference'],
  difficulty: ['beginner', 'intermediate', 'advanced'],
  tags: ['accessibility', 'example', 'required', 'interactive'],
}

export function SearchFilterPanel({
  filters,
  toggleFilter,
  clearFilters,
  onApply,
}: SearchFilterPanelProps) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(filterOptions).map(([key, options]) => (
          <div key={key}>
            <Label className="text-sm font-medium mb-2 block capitalize">{key}</Label>
            <div className="space-y-2">
              {options.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${key}-${option}`}
                    checked={filters[key as keyof typeof filters].includes(option)}
                    onCheckedChange={() => toggleFilter(key, option)}
                  />
                  <Label htmlFor={`${key}-${option}`} className="text-sm font-normal capitalize">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearFilters}
        >
          Clear All Filters
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onApply}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
}

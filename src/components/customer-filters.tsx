"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Filter, Search, X } from "lucide-react"
import { useState } from "react"

interface CustomerFiltersProps {
  onFilterChange?: (filters: CustomerFilterState) => void
  onSearch?: (searchTerm: string) => void
}

export interface CustomerFilterState {
  status: string
  hairType: string
  preferredBarber: string
  loyaltyTier: string
  sortBy: string
}

export function CustomerFilters({ onFilterChange, onSearch }: CustomerFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<CustomerFilterState>({
    status: "all",
    hairType: "all",
    preferredBarber: "all",
    loyaltyTier: "all",
    sortBy: "name"
  })

  const handleFilterChange = (key: keyof CustomerFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onSearch?.(value)
  }

  const clearFilters = () => {
    const defaultFilters = {
      status: "all",
      hairType: "all",
      preferredBarber: "all",
      loyaltyTier: "all",
      sortBy: "name"
    }
    setFilters(defaultFilters)
    setSearchTerm("")
    onFilterChange?.(defaultFilters)
    onSearch?.("")
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.hairType} onValueChange={(value) => handleFilterChange("hairType", value)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Hair Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="straight">Straight</SelectItem>
            <SelectItem value="wavy">Wavy</SelectItem>
            <SelectItem value="curly">Curly</SelectItem>
            <SelectItem value="coily">Coily</SelectItem>
            <SelectItem value="fine">Fine</SelectItem>
            <SelectItem value="thick">Thick</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.preferredBarber} onValueChange={(value) => handleFilterChange("preferredBarber", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Preferred Barber" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Barbers</SelectItem>
            <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
            <SelectItem value="sarah-davis">Sarah Davis</SelectItem>
            <SelectItem value="alex-rodriguez">Alex Rodriguez</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.loyaltyTier} onValueChange={(value) => handleFilterChange("loyaltyTier", value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Loyalty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="appointments">Most Appointments</SelectItem>
            <SelectItem value="revenue">Highest Spend</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )
}

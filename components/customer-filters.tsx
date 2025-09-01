"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

interface CustomerFiltersProps {
  onStatusChange: (status: string) => void
}

export function CustomerFilters({ onStatusChange }: CustomerFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select defaultValue="all" onValueChange={onStatusChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="vip">VIP</SelectItem>
          <SelectItem value="regular">Regular</SelectItem>
          <SelectItem value="new">New</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

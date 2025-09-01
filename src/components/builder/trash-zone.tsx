"use client"

import { Trash2 } from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"
import type { PageComponent } from "@/app/builder/page"
import { useState } from "react"

interface TrashZoneProps {
  onComponentDelete: (componentId: string) => void
}

export function TrashZone({ onComponentDelete }: TrashZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag leave if we're actually leaving the trash zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const componentId = e.dataTransfer.getData('text/plain')
    if (componentId) {
      onComponentDelete(componentId)
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center cursor-pointer",
        isDragOver
          ? "border-destructive bg-destructive/10 scale-110 shadow-lg"
          : "border-muted-foreground/30 bg-background/80 hover:border-destructive/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Trash2
        className={cn(
          "h-8 w-8 transition-colors",
          isDragOver ? "text-destructive" : "text-muted-foreground"
        )}
      />
      {isDragOver && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-2 py-1 text-xs rounded whitespace-nowrap">
          Drop to delete
        </div>
      )}
    </div>
  )
}

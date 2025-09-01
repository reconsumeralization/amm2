// src/components/ui/loading.tsx
"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "spinner" | "dots" | "pulse" | "bars"
  text?: string
  className?: string
  fullScreen?: boolean
  overlay?: boolean
}

/**
 * Loading component with multiple variants and sizes
 */
export function Loading({
  size = "md",
  variant = "spinner",
  text,
  className,
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
    overlay && "absolute inset-0 z-10 bg-background/60 backdrop-blur-sm rounded-lg",
    !fullScreen && !overlay && "p-4",
    className
  )

  const renderSpinner = () => (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )

  const renderDots = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="flex space-x-1">
        <div className={cn(
          "bg-primary rounded-full animate-bounce",
          size === "sm" && "w-2 h-2",
          size === "md" && "w-3 h-3",
          size === "lg" && "w-4 h-4",
          size === "xl" && "w-6 h-6"
        )} style={{ animationDelay: "0ms" }} />
        <div className={cn(
          "bg-primary rounded-full animate-bounce",
          size === "sm" && "w-2 h-2",
          size === "md" && "w-3 h-3",
          size === "lg" && "w-4 h-4",
          size === "xl" && "w-6 h-6"
        )} style={{ animationDelay: "150ms" }} />
        <div className={cn(
          "bg-primary rounded-full animate-bounce",
          size === "sm" && "w-2 h-2",
          size === "md" && "w-3 h-3",
          size === "lg" && "w-4 h-4",
          size === "xl" && "w-6 h-6"
        )} style={{ animationDelay: "300ms" }} />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )

  const renderPulse = () => (
    <div className="flex flex-col items-center gap-3">
      <div className={cn(
        "bg-primary rounded-full animate-pulse",
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )

  const renderBars = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary animate-pulse rounded-sm",
              size === "sm" && "w-1 h-4",
              size === "md" && "w-1.5 h-6",
              size === "lg" && "w-2 h-8",
              size === "xl" && "w-3 h-12"
            )}
            style={{
              animationDelay: `${i * 100}ms`,
              animationDuration: "1.5s"
            }}
          />
        ))}
      </div>
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )

  const renderLoading = () => {
    switch (variant) {
      case "dots":
        return renderDots()
      case "pulse":
        return renderPulse()
      case "bars":
        return renderBars()
      case "spinner":
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={containerClasses}>
      {renderLoading()}
    </div>
  )
}

/**
 * Skeleton loading component for content placeholders
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/**
 * Page-level loading component
 */
export function PageLoading({
  title = "Loading...",
  description,
  variant = "spinner",
  size = "lg"
}: {
  title?: string
  description?: string
  variant?: LoadingProps["variant"]
  size?: LoadingProps["size"]
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <Loading variant={variant} size={size} />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Card loading skeleton
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

/**
 * Table loading skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Form loading skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

/**
 * Inline loading component for buttons and small elements
 */
export function InlineLoading({ size = "sm", className }: { size?: "sm" | "md"; className?: string }) {
  return (
    <Loader2
      className={cn(
        "animate-spin",
        size === "sm" && "w-4 h-4",
        size === "md" && "w-5 h-5",
        className
      )}
    />
  )
}

export default Loading

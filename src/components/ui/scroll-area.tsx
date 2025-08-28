import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
  children: ReactNode
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <div className="h-full w-full rounded-[inherit]">{children}</div>
      </div>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'

export { ScrollArea }
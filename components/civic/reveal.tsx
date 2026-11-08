import * as React from "react"
import { cn } from "@/lib/utils"

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delayMs?: number
  className?: string
}

/**
 * Consistent, GPU-composited entrance animation wrapper across all routes and breakpoints.
 * Uses pure CSS keyframes (`civic-fade-up`) starting from `opacity: 0.01` on Frame 0 and
 * ending at `transform: none` so:
 * 1. Content never stays invisible (`opacity: 0`) waiting for JS hydration or IntersectionObserver.
 * 2. Every navigated page and section animates with identical timing and easing.
 * 3. `position: sticky` toolbars and child elements are never broken by lingering transforms.
 * 4. Lighthouse FCP / LCP / CLS remain near 100 across Mobile and Desktop.
 */
export function Reveal({
  children,
  delayMs = 0,
  className,
  style,
  ...props
}: RevealProps) {
  const cappedDelay = Math.min(Math.max(0, delayMs), 120)

  return (
    <div
      style={
        cappedDelay > 0
          ? { animationDelay: `${cappedDelay}ms`, ...style }
          : style
      }
      className={cn(
        "animate-civic-fade-up motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

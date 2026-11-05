"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delayMs?: number
  className?: string
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
  mediaQuery.addEventListener("change", callback)
  return () => mediaQuery.removeEventListener("change", callback)
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getReducedMotionServerSnapshot() {
  return false
}

/**
 * Smooth entrance & scroll-reveal wrapper for non-technical civic presentation.
 * Uses IntersectionObserver asynchronously so it respects React 19 hook rules
 * and `prefers-reduced-motion`.
 */
export function Reveal({
  children,
  delayMs = 0,
  className,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const isReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
  const [inView, setInView] = React.useState(false)

  const visible = isReducedMotion || inView

  React.useEffect(() => {
    if (isReducedMotion) return

    const element = ref.current
    if (!element) return

    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setInView(true))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
            break
          }
        }
      },
      {
        rootMargin: "80px 0px 80px 0px",
        threshold: 0,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [isReducedMotion])

  return (
    <div
      ref={ref}
      style={delayMs > 0 && visible ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}


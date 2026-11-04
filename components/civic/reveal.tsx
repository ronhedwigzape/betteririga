"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delayMs?: number
  className?: string
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
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const raf = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(raf)
    }

    const element = ref.current
    if (!element) return

    if (typeof IntersectionObserver === "undefined") {
      const raf = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(raf)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      {
        rootMargin: "50px 0px 50px 0px",
        threshold: 0,
      }
    )

    observer.observe(element)

    // Safety fallback: guaranteed visibility after 350ms even if observer doesn't fire
    const fallbackTimer = window.setTimeout(() => setVisible(true), 350)

    return () => {
      observer.disconnect()
      window.clearTimeout(fallbackTimer)
    }
  }, [])

  return (
    <div
      ref={ref}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        "transition-all duration-700 ease-out will-change-[opacity,transform] motion-reduce:translate-y-0 motion-reduce:opacity-100",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}


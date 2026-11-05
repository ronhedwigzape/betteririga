"use client"

import * as React from "react"
import dynamic from "next/dynamic"

const IrigaLivelySections = dynamic(
  () =>
    import("@/components/civic/iriga-lively-sections").then(
      (m) => m.IrigaLivelySections
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] w-full animate-pulse rounded-2xl bg-muted/20" />
    ),
  }
)

export function LivelySectionsLazy() {
  const [inView, setInView] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setInView(true), 0)
      return () => clearTimeout(timer)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "600px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      {inView ? (
        <IrigaLivelySections />
      ) : (
        <div className="h-[360px] w-full rounded-2xl bg-muted/20" />
      )}
    </div>
  )
}

import * as React from "react"
import { cn } from "@/lib/utils"

export function CivicPageContainer({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  )
}

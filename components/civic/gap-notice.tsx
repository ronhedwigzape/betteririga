import Link from "next/link"
import { AlertCircle, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface GapNoticeProps {
  gaps: string[]
  className?: string
  title?: string
}

export function GapNotice({
  gaps,
  className,
  title = "Data Not Yet Verified (Open Gap)",
}: GapNoticeProps) {
  if (!gaps || gaps.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-lg border border-amber-300/80 bg-amber-50/80 p-2.5 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-200",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              {title}
            </p>
            <ul className="list-disc space-y-0.5 pl-4 text-amber-900/90 dark:text-amber-200/90">
              {gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </div>
        </div>
        <Link
          href="/about#contribute"
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-400/70 bg-white/80 px-2 py-1 text-[11px] font-medium text-amber-950 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
        >
          Help verify source
          <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}


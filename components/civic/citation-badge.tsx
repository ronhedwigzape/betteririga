import { ExternalLink, ShieldCheck, Archive } from "lucide-react"
import type { Citation } from "@/lib/data/iriga-data"
import { cn } from "@/lib/utils"

interface CitationBadgeProps {
  citation: Citation
  recordId?: string
  className?: string
  compact?: boolean
}

export function CitationBadge({
  citation,
  className,
  compact = false,
}: CitationBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0 break-words rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-2.5 py-1.5 text-xs text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-200",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5 font-medium">
        <ShieldCheck className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          {compact ? "Official Source:" : "Checked from Official Source:"}{" "}
          <a
            href={citation.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-100"
          >
            {citation.sourceName}
            <ExternalLink className="ml-1 inline size-3" />
          </a>
        </span>
      </span>

      <span className="text-emerald-800/80 dark:text-emerald-300/80">
        Date Checked:{" "}
        <time dateTime={citation.retrievedAt}>{citation.retrievedAt}</time>
      </span>

      {citation.archiveUrl ? (
        <a
          href={citation.archiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded bg-emerald-100/90 px-1.5 py-0.5 text-[11px] font-medium text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-100 dark:hover:bg-emerald-900"
          title="Open saved backup copy of this page"
        >
          <Archive className="size-3" />
          Saved Backup Copy
        </a>
      ) : null}
    </div>
  )
}

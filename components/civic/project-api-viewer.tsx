"use client"

import * as React from "react"
import { Code2, Check, Copy, ChevronDown, ChevronUp, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProjectApiViewerProps {
  data: Record<string, unknown>
  apiEndpoint?: string
  sourceName: string
}

export function ProjectApiViewer({
  data,
  apiEndpoint,
  sourceName,
}: ProjectApiViewerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore clipboard write restrictions
    }
  }

  return (
    <Card className="rounded-2xl border-border/90 bg-muted/20 shadow-xs">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-bold text-foreground">
                Open Data API Record & Raw Fields
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Synchronized from <span className="font-semibold text-foreground">{sourceName}</span>.
              {apiEndpoint ? (
                <> Upstream API: <code className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">{apiEndpoint}</code></>
              ) : null}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Code2 className="size-3.5 text-blue-600" />
              <span>{isOpen ? "Hide API Data" : "Inspect Open API JSON"}</span>
              {isOpen ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>

            {isOpen ? (
              <Button
                type="button"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>

        {isOpen ? (
          <div className="mt-4">
            <pre className="max-h-80 overflow-x-auto rounded-xl border border-border/80 bg-slate-950 p-4 font-mono text-xs text-slate-100 dark:bg-black/80">
              <code>{jsonString}</code>
            </pre>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

"use client"

import { Loader2 } from "lucide-react"
import { MessageCard } from "./MessageCard"

export function ThinkingIndicator({ content }: { content: string }) {
  const hasContent = content && content.trim().length > 0

  return (
    <MessageCard title="Agent 思考中" tone="gold">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <Loader2 className="size-4 animate-spin text-[var(--color-gold)]" aria-hidden="true" />
          <span>正在处理...</span>
        </div>
        {hasContent && (
          <div className="max-h-[320px] overflow-y-auto rounded-md border border-border bg-[rgba(252,251,248,0.58)] p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
            {content}
          </div>
        )}
        {!hasContent && (
          <p className="text-xs text-[var(--color-muted)]">等待第一步...</p>
        )}
      </div>
    </MessageCard>
  )
}

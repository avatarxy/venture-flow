"use client"

import { Loader2 } from "lucide-react"
import { MessageCard } from "./MessageCard"

export function ThinkingIndicator({ content }: { content: string }) {
  return (
    <MessageCard title="Agent 正在处理" tone="gold">
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 animate-spin text-[var(--color-gold)]" aria-hidden="true" />
        <span>{content || "正在分析下一步..."}</span>
      </div>
    </MessageCard>
  )
}

"use client"

import { AlertTriangle } from "lucide-react"
import { MessageCard } from "./MessageCard"

export function ErrorCard({ content }: { content: string }) {
  return (
    <MessageCard title="需要处理" tone="error">
      <div className="flex gap-2">
        <AlertTriangle className="mt-1 size-4 shrink-0 text-[var(--color-error)]" aria-hidden="true" />
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </MessageCard>
  )
}

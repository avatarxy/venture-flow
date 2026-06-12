"use client"

import { Target } from "lucide-react"
import { MessageCard } from "./MessageCard"

type StrategyCardProps = {
  content: string
  strategy?: unknown
}

function readArray(source: unknown, key: string) {
  if (typeof source !== "object" || source === null || !(key in source)) return []
  const value = (source as Record<string, unknown>)[key]
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function readString(source: unknown, key: string) {
  if (typeof source !== "object" || source === null || !(key in source)) return ""
  const value = (source as Record<string, unknown>)[key]
  return typeof value === "string" ? value : ""
}

export function StrategyCard({ content, strategy }: StrategyCardProps) {
  const metrics = readArray(strategy, "successMetrics")
  const pains = readArray(strategy, "painPoints")
  const pattern = readString(strategy, "recommendedAppPattern")

  return (
    <MessageCard title="Strategy" tone="gold">
      <div className="space-y-3">
        <p className="whitespace-pre-wrap text-foreground">{content}</p>
        {pattern ? <p className="text-xs text-muted-foreground">推荐应用模式：{pattern}</p> : null}
        <div className="grid gap-2">
          {[...pains.slice(0, 2), ...metrics.slice(0, 2)].map((item) => (
            <div key={item} className="flex gap-2 text-xs text-muted-foreground">
              <Target className="mt-0.5 size-3.5 shrink-0 text-[var(--color-gold)]" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </MessageCard>
  )
}

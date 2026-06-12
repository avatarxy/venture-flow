"use client"

import { Boxes, Workflow } from "lucide-react"
import { MessageCard } from "./MessageCard"
import { MarkdownContent } from "../MarkdownContent"

type BlueprintCardProps = {
  content: string
  blueprint?: unknown
}

function readList(source: unknown, key: string) {
  if (typeof source !== "object" || source === null || !(key in source)) return []
  const value = (source as Record<string, unknown>)[key]
  return Array.isArray(value) ? value : []
}

function readString(item: unknown, key: string) {
  if (typeof item !== "object" || item === null || !(key in item)) return ""
  const value = (item as Record<string, unknown>)[key]
  return typeof value === "string" ? value : ""
}

export function BlueprintCard({ content, blueprint }: BlueprintCardProps) {
  const entities = readList(blueprint, "entities")
  const pages = readList(blueprint, "pages")
  const workflows = readList(blueprint, "workflows")

  return (
    <MessageCard title="产品蓝图" tone="info">
      <div className="space-y-3">
        <MarkdownContent content={content} />
        <div className="grid grid-cols-3 gap-2">
          <Metric label="实体" value={entities.length} />
          <Metric label="页面" value={pages.length} />
          <Metric label="流程" value={workflows.length} />
        </div>
        <div className="grid gap-2">
          {entities.slice(0, 4).map((entity, index) => (
            <div key={`${readString(entity, "name")}-${index}`} className="flex gap-2 border border-border bg-[rgba(252,251,248,0.46)] p-2 text-xs [border-radius:6px]">
              <Boxes className="mt-0.5 size-3.5 shrink-0 text-[var(--color-info)]" aria-hidden="true" />
              <span className="min-w-0 truncate">{readString(entity, "label") || readString(entity, "name")}</span>
            </div>
          ))}
        </div>
        {workflows[0] ? (
          <div className="flex gap-2 text-xs text-muted-foreground">
            <Workflow className="mt-0.5 size-3.5 shrink-0 text-[var(--color-info)]" aria-hidden="true" />
            <span>{readString(workflows[0], "title")}</span>
          </div>
        ) : null}
      </div>
    </MessageCard>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-[rgba(252,251,248,0.5)] p-2 text-center [border-radius:6px]">
      <p className="text-base font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

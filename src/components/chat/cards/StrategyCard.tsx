"use client"

import { Target } from "lucide-react"
import { MessageCard } from "./MessageCard"
import { MarkdownContent } from "../MarkdownContent"

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

export function createStrategyDisplayModel(content: string, strategy: unknown) {
  const problemSummary = readString(strategy, "problemSummary")
  const targetUsers = readArray(strategy, "targetUsers")
  const painPoints = readArray(strategy, "painPoints")
  const desiredOutcomes = readArray(strategy, "desiredOutcomes")
  const successMetrics = readArray(strategy, "successMetrics")
  const recommendedAppPattern = readString(strategy, "recommendedAppPattern")

  const hasStructuredStrategy = Boolean(
    problemSummary ||
      targetUsers.length ||
      painPoints.length ||
      desiredOutcomes.length ||
      successMetrics.length ||
      recommendedAppPattern,
  )

  return {
    rawContent: hasStructuredStrategy ? undefined : content,
    problemSummary,
    targetUsers,
    painPoints,
    desiredOutcomes,
    successMetrics,
    recommendedAppPattern,
  }
}

export function StrategyCard({ content, strategy }: StrategyCardProps) {
  const model = createStrategyDisplayModel(content, strategy)

  return (
    <MessageCard title="策略分析" tone="gold">
      <div className="space-y-3">
        {model.rawContent ? <MarkdownContent content={model.rawContent} /> : null}
        {model.problemSummary ? <Section title="核心问题" items={[model.problemSummary]} /> : null}
        {model.targetUsers.length ? <Section title="目标用户" items={[model.targetUsers.join("、")]} /> : null}
        {model.painPoints.length ? <Section title="痛点" items={model.painPoints} /> : null}
        {model.desiredOutcomes.length ? <Section title="期望结果" items={model.desiredOutcomes} /> : null}
        {model.successMetrics.length ? <Section title="成功指标" items={model.successMetrics} /> : null}
        {model.recommendedAppPattern ? <p className="text-xs text-muted-foreground">推荐应用模式：{model.recommendedAppPattern}</p> : null}
      </div>
    </MessageCard>
  )
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="space-y-1.5">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <div className="grid gap-1.5">
        {items.map((item) => (
          <div key={item} className="flex gap-2 text-xs text-muted-foreground">
            <Target className="mt-0.5 size-3.5 shrink-0 text-[var(--color-gold)]" aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

"use client"

import { Check, FastForward, RefreshCcw, Wand2 } from "lucide-react"
import type { ChatMessageType } from "@/server/contracts"

type InlineActionsProps = {
  onAction: (message: string) => void
  disabled?: boolean
  context?: ChatMessageType
}

type ActionItem = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}

// Context-specific action sets. Each ChatMessageType that supports inline
// actions gets its own relevant set instead of sharing a generic one.
const actionSets: Partial<Record<ChatMessageType, ActionItem[]>> = {
  "agent-strategy": [
    { label: "继续生成 Blueprint", value: "继续", icon: FastForward },
    { label: "重新分析", value: "重新分析业务问题，换一个角度切入。", icon: RefreshCcw },
  ],
  "agent-blueprint": [
    { label: "继续生成应用", value: "继续", icon: FastForward },
    { label: "修改 Blueprint", value: "我想修改 Blueprint：请让方案更贴合一线团队的日常工作流。", icon: Wand2 },
  ],
  "agent-build": [
    { label: "确认", value: "确认，就这样完成。", icon: Check },
    { label: "重新生成", value: "请重新生成应用，并保持当前 Blueprint 的核心目标。", icon: RefreshCcw },
  ],
  "agent-review": [
    { label: "确认通过", value: "确认，就这样完成。", icon: Check },
    { label: "修复问题", value: "请修复 Review 中发现的问题并重新生成。", icon: Wand2 },
  ],
  "agent-question": [
    { label: "确认", value: "确认", icon: Check },
    { label: "跳过", value: "跳过这一步，直接继续。", icon: FastForward },
  ],
  "agent-error": [
    { label: "重试", value: "请重试上一步操作。", icon: RefreshCcw },
  ],
}

// Generic fallback for unknown contexts
const genericActions: ActionItem[] = [
  { label: "继续", value: "继续", icon: FastForward },
]

export function InlineActions({ onAction, disabled, context }: InlineActionsProps) {
  const actions = context ? (actionSets[context] ?? genericActions) : genericActions

  if (actions.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            type="button"
            disabled={disabled}
            onClick={() => onAction(action.value)}
            className="inline-flex h-8 items-center gap-1.5 border border-[var(--color-border-interactive)] px-2.5 text-xs text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-45 [border-radius:6px]"
          >
            <Icon className="size-3.5" aria-hidden={true} />
            {action.label}
          </button>
        )
      })}
    </div>
  )
}

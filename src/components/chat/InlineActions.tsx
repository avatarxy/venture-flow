"use client"

import { Check, FastForward, RefreshCcw, Wand2 } from "lucide-react"

type InlineActionsProps = {
  onAction: (message: string) => void
  disabled?: boolean
}

const actions = [
  { label: "继续", value: "继续", icon: FastForward },
  { label: "修改 Blueprint", value: "我想修改 Blueprint：请让方案更贴合一线团队的日常工作流。", icon: Wand2 },
  { label: "重新生成", value: "请重新生成应用，并保持当前 Blueprint 的核心目标。", icon: RefreshCcw },
  { label: "确认", value: "确认，就这样完成。", icon: Check },
]

export function InlineActions({ onAction, disabled }: InlineActionsProps) {
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
            <Icon className="size-3.5" aria-hidden="true" />
            {action.label}
          </button>
        )
      })}
    </div>
  )
}

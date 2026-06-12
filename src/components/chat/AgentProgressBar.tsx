"use client"

import { CheckCircle2, Circle, Loader2 } from "lucide-react"

type AgentProgressBarProps = {
  currentStep: number
  totalSteps: number
  isRunning: boolean
  plan?: Array<{ title?: string; status?: string }>
}

export function AgentProgressBar({ currentStep, totalSteps, isRunning, plan = [] }: AgentProgressBarProps) {
  const safeTotal = Math.max(totalSteps, 1)
  const percent = Math.min(100, Math.round((currentStep / safeTotal) * 100))
  const activeStep = plan[currentStep]?.title ?? plan[currentStep - 1]?.title ?? "等待下一步"

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">Agent Pipeline</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{isRunning ? activeStep : `${currentStep}/${safeTotal} 步骤完成`}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isRunning ? <Loader2 className="size-3.5 animate-spin text-[var(--color-gold)]" aria-hidden="true" /> : <CheckCircle2 className="size-3.5 text-[var(--color-success)]" aria-hidden="true" />}
          {percent}%
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden bg-[rgba(28,28,28,0.06)] [border-radius:999px]">
        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      {plan.length > 0 ? (
        <div className="mt-3 grid grid-cols-6 gap-1">
          {plan.slice(0, 6).map((item, index) => (
            <span
              key={`${item.title ?? "step"}-${index}`}
              className="flex h-6 items-center justify-center border border-border bg-[rgba(252,251,248,0.48)] text-muted-foreground [border-radius:6px]"
              title={item.title}
            >
              {index < currentStep ? <CheckCircle2 className="size-3 text-[var(--color-success)]" aria-hidden="true" /> : <Circle className="size-3" aria-hidden="true" />}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

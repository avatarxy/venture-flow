"use client"

import { useEffect, useMemo, useRef } from "react"
import type { UIMessage } from "ai"
import { AgentProgressBar } from "./AgentProgressBar"
import { ChatInput } from "./ChatInput"
import { ChatMessage } from "./ChatMessage"
import type { VentureFlowUiMessage } from "./message-utils"

type AgentPlanItem = {
  title?: string
  status?: string
}

type AgentStateSummary = {
  currentStep?: number
  currentPlan?: AgentPlanItem[]
}

type ChatPanelProps = {
  messages: UIMessage[]
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onStop: () => void
  onAction: (message: string) => void
}

function readAgentState(messages: UIMessage[]): AgentStateSummary {
  const agentMessage = [...messages].reverse().find((message) => message.role === "assistant")
  const metadata = agentMessage?.metadata
  const state = typeof metadata === "object" && metadata !== null && "agentState" in metadata ? (metadata as { agentState?: unknown }).agentState : undefined

  if (typeof state !== "object" || state === null) {
    return {}
  }

  const currentStep = "currentStep" in state && typeof (state as { currentStep?: unknown }).currentStep === "number" ? (state as { currentStep: number }).currentStep : undefined
  const currentPlan = "currentPlan" in state && Array.isArray((state as { currentPlan?: unknown }).currentPlan) ? ((state as { currentPlan: AgentPlanItem[] }).currentPlan) : undefined

  return { currentStep, currentPlan }
}

export function ChatPanel({ messages, input, isLoading, onInputChange, onSubmit, onStop, onAction }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const agentState = useMemo(() => readAgentState(messages), [messages])
  const totalSteps = agentState.currentPlan?.length ?? 6

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  return (
    <section className="flex min-h-0 flex-col border-r border-border bg-background">
      <AgentProgressBar
        currentStep={agentState.currentStep ?? 0}
        totalSteps={totalSteps}
        isRunning={isLoading}
        plan={agentState.currentPlan}
      />
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[280px] items-center justify-center text-center text-sm leading-6 text-muted-foreground">
            <p className="max-w-[280px]">描述业务问题或让 Agent 继续，它会把 Strategy、Blueprint、Build 和 Review 逐步放到这里。</p>
          </div>
        ) : null}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message as VentureFlowUiMessage}
            onAction={onAction}
            actionDisabled={isLoading}
          />
        ))}
      </div>
      <ChatInput input={input} isLoading={isLoading} onInputChange={onInputChange} onSubmit={onSubmit} onStop={onStop} />
    </section>
  )
}

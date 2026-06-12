"use client"

import { User } from "lucide-react"
import { InlineActions } from "./InlineActions"
import { extractPreviewFiles, getMessageText, getMessageType, type VentureFlowUiMessage } from "./message-utils"
import { BlueprintCard } from "./cards/BlueprintCard"
import { BuildResultCard } from "./cards/BuildResultCard"
import { ErrorCard } from "./cards/ErrorCard"
import { MessageCard } from "./cards/MessageCard"
import { ReviewResultCard } from "./cards/ReviewResultCard"
import { StrategyCard } from "./cards/StrategyCard"
import { ThinkingIndicator } from "./cards/ThinkingIndicator"
import type { ChatMessageType } from "@/server/contracts"

type ChatMessageProps = {
  message: VentureFlowUiMessage
  onAction: (message: string) => void
  actionDisabled?: boolean
}

function metadataValue(message: VentureFlowUiMessage, key: string) {
  return message.metadata && key in message.metadata ? message.metadata[key] : undefined
}

export function ChatMessage({ message, onAction, actionDisabled }: ChatMessageProps) {
  const content = getMessageText(message)
  const type = getMessageType(message)
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[86%] bg-[var(--color-ink)] px-3 py-2 text-sm leading-6 text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)] [border-radius:8px]">
          <div className="mb-1 flex items-center justify-end gap-1.5 text-xs opacity-70">
            <span>你</span>
            <User className="size-3" aria-hidden="true" />
          </div>
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    )
  }

  if (type === "agent-thinking") {
    return <ThinkingIndicator content={content} />
  }

  if (type === "agent-error") {
    return (
      <div>
        <ErrorCard content={content} />
        <InlineActions onAction={onAction} disabled={actionDisabled} context={type as ChatMessageType} />
      </div>
    )
  }

  if (type === "agent-strategy") {
    return (
      <div>
        <StrategyCard content={content} strategy={metadataValue(message, "strategy")} />
        <InlineActions onAction={onAction} disabled={actionDisabled} context={type as ChatMessageType} />
      </div>
    )
  }

  if (type === "agent-blueprint") {
    return (
      <div>
        <BlueprintCard content={content} blueprint={metadataValue(message, "blueprint")} />
        <InlineActions onAction={onAction} disabled={actionDisabled} context={type as ChatMessageType} />
      </div>
    )
  }

  if (type === "agent-build") {
    return (
      <div>
        <BuildResultCard content={content} build={metadataValue(message, "build")} />
        {extractPreviewFiles(message).length > 0 ? null : <InlineActions onAction={onAction} disabled={actionDisabled} context={type as ChatMessageType} />}
      </div>
    )
  }

  if (type === "agent-review") {
    return (
      <div>
        <ReviewResultCard content={content} review={metadataValue(message, "review")} />
        <InlineActions onAction={onAction} disabled={actionDisabled} context={type as ChatMessageType} />
      </div>
    )
  }

  if (type === "agent-question") {
    return (
      <div>
        <MessageCard title="Agent 提问" tone="gold">
          <p className="whitespace-pre-wrap">{content}</p>
        </MessageCard>
        <InlineActions onAction={onAction} disabled={actionDisabled} context={type as ChatMessageType} />
      </div>
    )
  }

  return (
    <MessageCard title={type === "system-info" ? "System" : "Agent"} tone="neutral">
      <p className="whitespace-pre-wrap">{content}</p>
    </MessageCard>
  )
}

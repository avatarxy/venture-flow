import { generatedFileSchema, type ChatMessageType, type GeneratedFile } from "@/server/contracts"

type TextPart = {
  type: string
  text?: unknown
}

export type VentureFlowUiMessage = {
  id: string
  role: string
  content?: unknown
  type?: unknown
  parts?: TextPart[]
  metadata?: Record<string, unknown> | null
}

const defaultAssistantType: ChatMessageType = "agent-thinking"

export function getMessageText(message: VentureFlowUiMessage) {
  if (Array.isArray(message.parts)) {
    const text = message.parts
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("")

    if (text.trim().length > 0) {
      return text
    }
  }

  return typeof message.content === "string" ? message.content : ""
}

export function getMessageType(message: VentureFlowUiMessage): ChatMessageType {
  if (typeof message.type === "string") {
    return message.type as ChatMessageType
  }

  if (typeof message.metadata?.type === "string") {
    return message.metadata.type as ChatMessageType
  }

  if (message.role === "user") {
    return "user-text"
  }

  if (message.role === "system") {
    return "system-info"
  }

  return defaultAssistantType
}

export function extractPreviewFiles(message: VentureFlowUiMessage): GeneratedFile[] {
  const files = message.metadata?.build
    && typeof message.metadata.build === "object"
    && "files" in message.metadata.build
    ? (message.metadata.build as { files?: unknown }).files
    : undefined

  if (!Array.isArray(files)) {
    return []
  }

  return files
    .map((file) => generatedFileSchema.safeParse(file))
    .filter((result) => result.success)
    .map((result) => result.data)
}

export function toAiTextPart(content: string) {
  return [{ type: "text" as const, text: content }]
}

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import type { ChatTransport, UIMessage, UIMessageChunk } from "ai"
import { extractPreviewFiles, getMessageText, toAiTextPart } from "@/components/chat/message-utils"
import type { GeneratedFile } from "@/server/contracts"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkspaceMessageMetadata = Record<string, unknown>
type WorkspaceUiMessage = UIMessage<WorkspaceMessageMetadata>

type AgentMessagePayload = {
  role: "agent" | "system"
  type: string
  content: string
  metadata?: Record<string, unknown> | null
}

export type UseAgentChatOptions = {
  projectId: string
  originalProblem: string
  initialMessages: WorkspaceUiMessage[]
  initialPreviewFiles: GeneratedFile[]
}

type SystemErrorMessage = {
  id: string
  role: "system"
  type: "agent-error"
  content: string
  parts: Array<{ type: "text"; text: string }>
  metadata: { error: true; message: string }
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

class VentureFlowAgentTransport implements ChatTransport<WorkspaceUiMessage> {
  private latestAgentMessage: AgentMessagePayload | null = null
  private latestAgentMessages: AgentMessagePayload[] = []

  constructor(private readonly api: string) {}

  clearAgentMessage() {
    this.latestAgentMessage = null
    this.latestAgentMessages = []
  }

  getAgentMessage() {
    return this.latestAgentMessage
  }

  getAgentMessages() {
    return this.latestAgentMessages
  }

  async sendMessages(options: Parameters<ChatTransport<WorkspaceUiMessage>["sendMessages"]>[0]) {
    const lastMessage = options.messages.at(-1)
    const message = lastMessage ? getMessageText(lastMessage).trim() : ""

    if (message.length < 2) {
      throw new Error("消息不能为空")
    }

    let response: Response
    try {
      response = await fetch(this.api, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(options.headers as Record<string, string> | undefined) },
        body: JSON.stringify({ message }),
        signal: options.abortSignal,
      })
    } catch (error) {
      // Network errors (offline, DNS, CORS, etc.)
      const detail = error instanceof Error ? error.message : "网络连接失败"
      throw new AgentTransportError(detail, "NETWORK_ERROR")
    }

    let payload: {
      agentMessage?: AgentMessagePayload
      agentMessages?: AgentMessagePayload[]
      agentStatus?: string
      agentState?: Record<string, unknown>
      error?: string
    }
    try {
      payload = (await response.json()) as typeof payload
    } catch {
      throw new AgentTransportError("Agent 返回了无法解析的响应", "PARSE_ERROR")
    }

    const rawMessages = payload.agentMessages?.length ? payload.agentMessages : payload.agentMessage ? [payload.agentMessage] : []

    if (!response.ok || rawMessages.length === 0) {
      throw new AgentTransportError(
        payload.error ?? `Agent 响应失败 (HTTP ${response.status})`,
        "AGENT_ERROR",
      )
    }

    const agentMessages: AgentMessagePayload[] = rawMessages.map((message) => ({
      ...message,
      metadata: {
        ...(message.metadata ?? {}),
        type: message.type,
        agentStatus: payload.agentStatus,
        agentState: payload.agentState,
      },
    }))
    const agentMessage = agentMessages.at(-1)
    if (!agentMessage) {
      throw new AgentTransportError("Agent 没有返回可展示消息", "AGENT_ERROR")
    }

    this.latestAgentMessage = agentMessage
    this.latestAgentMessages = agentMessages

    return createSingleMessageStream(agentMessages.map((message) => message.content).join("\n\n"))
  }

  async reconnectToStream() {
    return null
  }
}

class AgentTransportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message)
    this.name = "AgentTransportError"
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function createSingleMessageStream(content: string): ReadableStream<UIMessageChunk> {
  const id = `agent-${crypto.randomUUID()}`

  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({ type: "text-start", id })
      controller.enqueue({ type: "text-delta", id, delta: content })
      controller.enqueue({ type: "text-end", id })
      controller.close()
    },
  })
}

function findLastAssistantIndex(messages: WorkspaceUiMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "assistant") return index
  }
  return -1
}

function createSystemError(id: string, message: string): SystemErrorMessage {
  return {
    id,
    role: "system",
    type: "agent-error",
    content: `❌ ${message}`,
    parts: [{ type: "text" as const, text: `❌ ${message}` }],
    metadata: { error: true, message },
  }
}

function createWorkspaceMessage(message: AgentMessagePayload, index: number): WorkspaceUiMessage {
  return {
    id: `agent-${Date.now()}-${index}`,
    role: message.role === "system" ? "system" : "assistant",
    parts: toAiTextPart(message.content),
    metadata: message.metadata ?? { type: message.type },
  } as WorkspaceUiMessage
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAgentChat({
  projectId,
  originalProblem,
  initialMessages,
  initialPreviewFiles,
}: UseAgentChatOptions) {
  const [input, setInput] = useState("")
  const [previewFiles, setPreviewFiles] = useState(initialPreviewFiles)
  const [activePane, setActivePane] = useState<"chat" | "preview">("chat")
  const autoStarted = useRef(false)

  const transport = useMemo(() => new VentureFlowAgentTransport(`/api/projects/${projectId}/agent/messages`), [projectId])

  const { messages, sendMessage, setMessages, status, stop } = useChat<WorkspaceUiMessage>({
    id: projectId,
    messages: initialMessages,
    transport,
  })

  const isLoading = status === "submitted" || status === "streaming"

  // ---- submitMessage ---------------------------------------------------
  const submitMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (trimmed.length < 2) return

      transport.clearAgentMessage()

      try {
        await sendMessage({ text: trimmed })
      } catch (error) {
        const detail =
          error instanceof AgentTransportError
            ? error.message
            : error instanceof Error
              ? error.message
              : "未知错误"

        // Inject error message into the UI message list so the user sees it
        setMessages((prev) => [
          ...prev,
          createSystemError(`err-${Date.now()}`, detail),
        ] as WorkspaceUiMessage[])
        return
      }

      const agentMessages = transport.getAgentMessages()
      const agentMessage = transport.getAgentMessage()
      if (!agentMessage || agentMessages.length === 0) return

      // 将临时 streaming 出来的一条 assistant 消息替换为完整执行轨迹。
      setMessages((currentMessages) => {
        const nextMessages = [...currentMessages]
        const assistantIndex = findLastAssistantIndex(nextMessages)
        if (assistantIndex === -1) return currentMessages
        const transcriptMessages = agentMessages.map(createWorkspaceMessage)
        nextMessages.splice(assistantIndex, 1, ...transcriptMessages)
        return nextMessages as WorkspaceUiMessage[]
      })

      // Extract preview files from build metadata
      const files = agentMessages.flatMap((message) =>
        extractPreviewFiles({
          id: `agent-metadata-${Date.now()}`,
          role: "assistant",
          parts: toAiTextPart(message.content),
          metadata: message.metadata ?? { type: message.type },
        }),
      )
      if (files.length > 0) {
        setPreviewFiles(files)
        setActivePane("preview")
      }
    },
    [sendMessage, setMessages, transport],
  )

  // ---- Auto-start (fixed race condition) --------------------------------
  useEffect(() => {
    if (autoStarted.current || initialMessages.length > 0 || originalProblem.trim().length < 2) {
      return
    }
    autoStarted.current = true
    void submitMessage(originalProblem)
  }, [initialMessages.length, originalProblem, submitMessage])

  // ---- Submit handler ---------------------------------------------------
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const nextInput = input.trim()
      if (nextInput.length < 2) return
      setInput("")
      void submitMessage(nextInput)
    },
    [input, submitMessage],
  )

  // ---- Stop handler ----------------------------------------------------
  const handleStop = useCallback(() => {
    void stop()
  }, [stop])

  return {
    // State
    messages,
    input,
    previewFiles,
    activePane,
    isLoading,
    // Actions
    setInput,
    setActivePane,
    submitMessage,
    handleSubmit,
    handleStop,
  }
}

export { VentureFlowAgentTransport, AgentTransportError, createSingleMessageStream, findLastAssistantIndex }
export type { WorkspaceUiMessage, AgentMessagePayload, SystemErrorMessage }

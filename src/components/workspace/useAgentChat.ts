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

// SSE event types (matches supervisor.ts StreamEvent)
type SSEStepEvent = {
  type: "thinking"
  step: number
  toolName: string
  message: string
  plan: unknown[]
}

type SSEStateEvent = {
  type: "state"
  step: number
  status: string
  plan: unknown[]
}

type SSEResultEvent = {
  type: "result"
  message: AgentMessagePayload
  plan: unknown[]
}

type SSEDoneEvent = {
  type: "done"
  status: string
  finalMessage?: AgentMessagePayload
}

type SSEErrorEvent = {
  type: "error"
  message: string
}

type SSEEvent = SSEStepEvent | SSEStateEvent | SSEResultEvent | SSEDoneEvent | SSEErrorEvent

const toolNameLabels: Record<string, string> = {
  analyze_problem: "分析业务问题",
  inspect_capabilities: "检查能力边界",
  create_blueprint: "生成 Product Blueprint",
  validate_blueprint: "校验 Blueprint",
  modify_blueprint: "修改 Blueprint",
  generate_application: "生成 React 应用",
  repair_application: "修复应用",
  inspect_build: "审查应用",
  regenerate_page: "重新生成页面",
  optimize_product: "优化产品",
  save_project: "保存项目",
}

function friendlyToolName(name: string) {
  return toolNameLabels[name] ?? name
}

// ---------------------------------------------------------------------------
// SSE Transport
// ---------------------------------------------------------------------------

class VentureFlowAgentTransport implements ChatTransport<WorkspaceUiMessage> {
  private latestAgentMessages: AgentMessagePayload[] = []
  private onCardCallback: ((msg: AgentMessagePayload) => void) | null = null

  constructor(private readonly api: string) {}

  /** 注册回调：每完成一个步骤就触发一次，用于注入独立卡片 */
  onCard(cb: (msg: AgentMessagePayload) => void) {
    this.onCardCallback = cb
  }

  clearAgentMessages() {
    this.latestAgentMessages = []
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
      const detail = error instanceof Error ? error.message : "网络连接失败"
      throw new AgentTransportError(detail, "NETWORK_ERROR")
    }

    if (!response.ok) {
      let errorMsg = `Agent 响应失败 (HTTP ${response.status})`
      try {
        const errPayload = (await response.json()) as { error?: string }
        errorMsg = errPayload.error ?? errorMsg
      } catch { /* ignore parse errors */ }
      throw new AgentTransportError(errorMsg, "AGENT_ERROR")
    }

    const contentType = response.headers.get("content-type") ?? ""

    if (contentType.includes("text/event-stream") && response.body) {
      return this.handleSSEStream(response.body, options.abortSignal)
    }

    // JSON fallback
    let payload: {
      agentMessage?: AgentMessagePayload
      agentMessages?: AgentMessagePayload[]
      agentState?: Record<string, unknown>
      error?: string
    }
    try {
      payload = (await response.json()) as typeof payload
    } catch {
      throw new AgentTransportError("Agent 返回了无法解析的响应", "PARSE_ERROR")
    }

    const rawMessages = payload.agentMessages?.length ? payload.agentMessages : payload.agentMessage ? [payload.agentMessage] : []
    if (rawMessages.length === 0) {
      throw new AgentTransportError(payload.error ?? "Agent 没有返回可展示消息", "AGENT_ERROR")
    }

    const agentMessages: AgentMessagePayload[] = rawMessages.map((msg) => ({
      ...msg,
      metadata: { ...(msg.metadata ?? {}), type: msg.type, agentState: payload.agentState },
    }))
    this.latestAgentMessages = agentMessages

    return createSingleMessageStream(agentMessages.map((msg) => msg.content).join("\n\n"))
  }

  private handleSSEStream(body: ReadableStream<Uint8Array>, abortSignal?: AbortSignal): ReadableStream<UIMessageChunk> {
    const messageId = `agent-${crypto.randomUUID()}`
    let started = false

    return new ReadableStream<UIMessageChunk>({
      start: async (controller) => {
        const reader = body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        const pushText = (text: string) => {
          if (!text) return
          if (!started) {
            controller.enqueue({ type: "text-start" as const, id: messageId })
            started = true
          }
          controller.enqueue({ type: "text-delta" as const, id: messageId, delta: text })
        }

        try {
          while (true) {
            if (abortSignal?.aborted) { controller.close(); return }

            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() ?? ""

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue
              const data = line.slice(6)
              if (!data) continue

              try {
                const event = JSON.parse(data) as SSEEvent

                switch (event.type) {
                  case "thinking": {
                    const detail = event.message ? ` — ${event.message}` : ""
                    pushText(`⏳ ${friendlyToolName(event.toolName)}${detail}\n`)
                    break
                  }

                  case "result": {
                    this.latestAgentMessages.push(event.message)
                    // 通过回调即时注入独立卡片
                    if (event.message.content && this.onCardCallback) {
                      this.onCardCallback(event.message)
                    }
                    break
                  }

                  case "state":
                    break

                  case "done": {
                    if (event.finalMessage && !this.latestAgentMessages.includes(event.finalMessage)) {
                      this.latestAgentMessages.push(event.finalMessage)
                      if (event.finalMessage.content && this.onCardCallback) {
                        this.onCardCallback(event.finalMessage)
                      }
                    }
                    break
                  }

                  case "error": {
                    const errorMessage: AgentMessagePayload = {
                      role: "agent",
                      type: "agent-error",
                      content: event.message,
                      metadata: { error: true },
                    }
                    this.latestAgentMessages.push(errorMessage)
                    if (this.onCardCallback) {
                      this.onCardCallback(errorMessage)
                    }
                    break
                  }
                }
              } catch { /* skip malformed SSE data */ }
            }
          }

          if (started) {
            controller.enqueue({ type: "text-end" as const, id: messageId })
          }
          controller.close()
        } catch (error) {
          if (started) { controller.enqueue({ type: "text-end" as const, id: messageId }) }
          const errMsg = error instanceof Error ? error.message : "流读取失败"
          controller.error(new AgentTransportError(errMsg, "STREAM_ERROR"))
        }
      },
    })
  }

  async reconnectToStream() { return null }
}

class AgentTransportError extends Error {
  constructor(message: string, public readonly code: string) {
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
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "assistant") return i
  }
  return -1
}

function hasVentureFlowMessageType(message: WorkspaceUiMessage) {
  return Boolean(
    message.metadata &&
      typeof message.metadata === "object" &&
      !Array.isArray(message.metadata) &&
      typeof (message.metadata as { type?: unknown }).type === "string",
  )
}

export function findStreamingAssistantIndex(messages: WorkspaceUiMessage[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (!message || message.role !== "assistant") continue
    if (hasVentureFlowMessageType(message)) continue

    const text = getMessageText(message).trim()
    if (text.startsWith("⏳")) {
      return i
    }
  }

  return -1
}

export function appendAgentCardMessage(messages: WorkspaceUiMessage[], card: WorkspaceUiMessage) {
  if (messages.some((message) => message.id === card.id)) {
    return messages
  }

  const streamingIdx = findStreamingAssistantIndex(messages)
  if (streamingIdx === -1) {
    return [...messages, card]
  }

  return [
    ...messages.slice(0, streamingIdx),
    card,
    ...messages.slice(streamingIdx),
  ]
}

export function removeStreamingAssistantMessage(messages: WorkspaceUiMessage[]) {
  const streamingIdx = findStreamingAssistantIndex(messages)
  if (streamingIdx === -1) {
    return messages
  }

  return [
    ...messages.slice(0, streamingIdx),
    ...messages.slice(streamingIdx + 1),
  ]
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

function createCardMessage(msg: AgentMessagePayload, index: number): WorkspaceUiMessage {
  return {
    id: `agent-card-${Date.now()}-${index}`,
    role: msg.role === "system" ? "system" : "assistant",
    parts: toAiTextPart(msg.content),
    metadata: {
      ...(msg.metadata ?? {}),
      type: msg.type, // ensure getMessageType() can find it
    },
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
  const pendingCards = useRef<WorkspaceUiMessage[]>([])
  const cardIndex = useRef(0)

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

      transport.clearAgentMessages()
      pendingCards.current = []
      cardIndex.current = 0

      // 注册回调：每完成一步就注入独立卡片
      transport.onCard((cardMsg: AgentMessagePayload) => {
        const card = createCardMessage(cardMsg, cardIndex.current++)
        pendingCards.current = [...pendingCards.current, card]

        // 将卡片即时插入到流式消息之前
        setMessages((prev) => {
          return appendAgentCardMessage(prev as WorkspaceUiMessage[], card) as WorkspaceUiMessage[]
        })
      })

      try {
        await sendMessage({ text: trimmed })
      } catch (error) {
        const detail =
          error instanceof AgentTransportError
            ? error.message
            : error instanceof Error
              ? error.message
              : "未知错误"
        setMessages((prev) => [...prev, createSystemError(`err-${Date.now()}`, detail)] as WorkspaceUiMessage[])
        return
      }

      // 流式结束 → 移除以"⏳"开头的流式占位消息
      setMessages((prev) => {
        const withCards = pendingCards.current.reduce(
          (nextMessages, card) => appendAgentCardMessage(nextMessages, card),
          prev as WorkspaceUiMessage[],
        )
        return removeStreamingAssistantMessage(withCards) as WorkspaceUiMessage[]
      })

      // Extract preview files
      const allMessages = transport.getAgentMessages()
      const files = allMessages.flatMap((msg) =>
        extractPreviewFiles({
          id: `agent-metadata-${Date.now()}`,
          role: "assistant",
          parts: toAiTextPart(msg.content),
          metadata: msg.metadata ?? { type: msg.type },
        }),
      )
      if (files.length > 0) {
        setPreviewFiles(files)
        setActivePane("preview")
      }
    },
    [sendMessage, setMessages, transport],
  )

  // ---- Auto-start -------------------------------------------------------
  useEffect(() => {
    if (autoStarted.current || initialMessages.length > 0 || originalProblem.trim().length < 2) return
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

  const handleStop = useCallback(() => { void stop() }, [stop])

  return {
    messages, input, previewFiles, activePane, isLoading,
    setInput, setActivePane, submitMessage, handleSubmit, handleStop,
  }
}

export { VentureFlowAgentTransport, AgentTransportError, createSingleMessageStream, findLastAssistantIndex }
export type { WorkspaceUiMessage, AgentMessagePayload, SystemErrorMessage }

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

    // ── SSE 流式模式 ──
    if (contentType.includes("text/event-stream") && response.body) {
      return this.handleSSEStream(response.body, options.abortSignal)
    }

    // ── 回退：JSON 模式（向后兼容） ──
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
      throw new AgentTransportError(
        payload.error ?? "Agent 没有返回可展示消息",
        "AGENT_ERROR",
      )
    }

    const agentMessages: AgentMessagePayload[] = rawMessages.map((msg) => ({
      ...msg,
      metadata: {
        ...(msg.metadata ?? {}),
        type: msg.type,
        agentState: payload.agentState,
      },
    }))
    const agentMessage = agentMessages.at(-1)
    if (!agentMessage) {
      throw new AgentTransportError("Agent 没有返回可展示消息", "AGENT_ERROR")
    }

    this.latestAgentMessage = agentMessage
    this.latestAgentMessages = agentMessages

    return createSingleMessageStream(agentMessages.map((msg) => msg.content).join("\n\n"))
  }

  /**
   * 解析 SSE 流并实时推送 text-delta chunks 到 AI SDK
   */
  private handleSSEStream(body: ReadableStream<Uint8Array>, abortSignal?: AbortSignal): ReadableStream<UIMessageChunk> {
    const collectedMessages: AgentMessagePayload[] = []
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
            if (abortSignal?.aborted) {
              controller.close()
              return
            }

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
                    // 仅显示进度指示，不输出静态管道描述文本
                    pushText(`⏳ ${friendlyToolName(event.toolName)}...\n`)
                    break
                  }

                  case "result": {
                    collectedMessages.push(event.message)
                    // 仅推送有实质内容的结果（跳过 inspect_capabilities 等后台步骤）
                    if (event.message.content) {
                      pushText(`\n${event.message.content}\n`)
                    }
                    break
                  }

                  case "state":
                    // 状态更新只影响进度条，不需要额外文本
                    break

                  case "done": {
                    if (event.finalMessage && !collectedMessages.some((m) => m === event.finalMessage)) {
                      collectedMessages.push(event.finalMessage)
                    }
                    break
                  }

                  case "error": {
                    pushText(`\n\n❌ ${event.message}\n`)
                    break
                  }
                }
              } catch {
                // skip malformed SSE data
              }
            }
          }

          if (started) {
            controller.enqueue({ type: "text-end" as const, id: messageId })
          }
          controller.close()

          // 保存收集到的消息用于后续替换
          if (collectedMessages.length > 0) {
            this.latestAgentMessage = collectedMessages.at(-1) ?? null
            this.latestAgentMessages = collectedMessages
          }
        } catch (error) {
          if (started) {
            controller.enqueue({ type: "text-end" as const, id: messageId })
          }
          const errMsg = error instanceof Error ? error.message : "流读取失败"
          controller.error(new AgentTransportError(errMsg, "STREAM_ERROR"))
        }
      },
    })
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
    id: `agent-msg-${Date.now()}-${index}`,
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

        setMessages((prev) => [
          ...prev,
          createSystemError(`err-${Date.now()}`, detail),
        ] as WorkspaceUiMessage[])
        return
      }

      const agentMessages = transport.getAgentMessages()
      const agentMessage = transport.getAgentMessage()
      if (!agentMessage || agentMessages.length === 0) return

      // 替换流式占位消息为独立的卡片消息
      setMessages((currentMessages) => {
        const nextMessages = [...currentMessages]
        const assistantIndex = findLastAssistantIndex(nextMessages)
        if (assistantIndex === -1) return currentMessages
        const transcriptMessages = agentMessages.map(createWorkspaceMessage)
        nextMessages.splice(assistantIndex, 1, ...transcriptMessages)
        return nextMessages as WorkspaceUiMessage[]
      })

      // Extract preview files from build metadata
      const files = agentMessages.flatMap((msg) =>
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
    messages,
    input,
    previewFiles,
    activePane,
    isLoading,
    setInput,
    setActivePane,
    submitMessage,
    handleSubmit,
    handleStop,
  }
}

export { VentureFlowAgentTransport, AgentTransportError, createSingleMessageStream, findLastAssistantIndex }
export type { WorkspaceUiMessage, AgentMessagePayload, SystemErrorMessage }

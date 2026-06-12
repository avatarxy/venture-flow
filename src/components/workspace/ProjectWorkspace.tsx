"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import type { ChatTransport, UIMessage, UIMessageChunk } from "ai"
import { MessageSquare, MonitorPlay } from "lucide-react"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { extractPreviewFiles, getMessageText, toAiTextPart } from "@/components/chat/message-utils"
import { SandpackRunner } from "@/components/generated-preview/SandpackRunner"
import type { GeneratedFile } from "@/server/contracts"

type WorkspaceMessageMetadata = Record<string, unknown>
type WorkspaceUiMessage = UIMessage<WorkspaceMessageMetadata>

type AgentMessagePayload = {
  role: "agent" | "system"
  type: string
  content: string
  metadata?: Record<string, unknown> | null
}

type ProjectWorkspaceProps = {
  projectId: string
  projectName: string
  originalProblem: string
  initialMessages: WorkspaceUiMessage[]
  initialPreviewFiles: GeneratedFile[]
}

class VentureFlowAgentTransport implements ChatTransport<WorkspaceUiMessage> {
  constructor(
    private readonly api: string,
    private readonly onAgentMessage: (message: AgentMessagePayload) => void,
  ) {}

  async sendMessages(options: Parameters<ChatTransport<WorkspaceUiMessage>["sendMessages"]>[0]) {
    const lastMessage = options.messages.at(-1)
    const message = lastMessage ? getMessageText(lastMessage).trim() : ""

    if (message.length < 2) {
      throw new Error("消息不能为空")
    }

    const response = await fetch(this.api, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(options.headers as Record<string, string> | undefined) },
      body: JSON.stringify({ message }),
      signal: options.abortSignal,
    })
    const payload = (await response.json()) as {
      agentMessage?: AgentMessagePayload
      agentStatus?: string
      agentState?: Record<string, unknown>
      error?: string
    }

    if (!response.ok || !payload.agentMessage) {
      throw new Error(payload.error ?? "Agent 响应失败")
    }

    const agentMessage = {
      ...payload.agentMessage,
      metadata: {
        ...(payload.agentMessage.metadata ?? {}),
        type: payload.agentMessage.type,
        agentStatus: payload.agentStatus,
        agentState: payload.agentState,
      },
    }
    this.onAgentMessage(agentMessage)

    return createSingleMessageStream(agentMessage.content)
  }

  async reconnectToStream() {
    return null
  }
}

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

export function ProjectWorkspace({
  projectId,
  projectName,
  originalProblem,
  initialMessages,
  initialPreviewFiles,
}: ProjectWorkspaceProps) {
  const [input, setInput] = useState("")
  const [previewFiles, setPreviewFiles] = useState(initialPreviewFiles)
  const [activePane, setActivePane] = useState<"chat" | "preview">("chat")
  const latestAgentMessage = useRef<AgentMessagePayload | null>(null)
  const didAutoStart = useRef(false)
  const transport = useMemo(
    () =>
      new VentureFlowAgentTransport(`/api/projects/${projectId}/agent/messages`, (message) => {
        latestAgentMessage.current = message
      }),
    [projectId],
  )

  const { messages, sendMessage, setMessages, status, stop } = useChat<WorkspaceUiMessage>({
    id: projectId,
    messages: initialMessages,
    transport,
  })

  const isLoading = status === "submitted" || status === "streaming"

  useEffect(() => {
    if (didAutoStart.current || initialMessages.length > 0 || originalProblem.trim().length < 2) {
      return
    }

    didAutoStart.current = true
    void submitMessage(originalProblem)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages.length, originalProblem])

  async function submitMessage(content: string) {
    const trimmed = content.trim()
    if (trimmed.length < 2) return

    latestAgentMessage.current = null
    await sendMessage({ text: trimmed })
    const agentMessage = latestAgentMessage.current as AgentMessagePayload | null

    if (!agentMessage) return

    const metadata = agentMessage.metadata ?? { type: agentMessage.type }
    setMessages((currentMessages) => {
      const nextMessages = [...currentMessages]
      const assistantIndex = findLastAssistantIndex(nextMessages)
      if (assistantIndex === -1) return currentMessages
      nextMessages[assistantIndex] = {
        ...nextMessages[assistantIndex],
        metadata,
      }
      return nextMessages
    })

    const files = extractPreviewFiles({
      id: `agent-metadata-${Date.now()}`,
      role: "assistant",
      parts: toAiTextPart(agentMessage.content),
      metadata,
    })
    if (files.length > 0) {
      setPreviewFiles(files)
      setActivePane("preview")
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextInput = input.trim()
    if (nextInput.length < 2) return
    setInput("")
    void submitMessage(nextInput)
  }

  return (
    <main className="flex h-[calc(100vh-57px)] min-h-[640px] flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{projectName}</p>
          <p className="truncate text-xs text-muted-foreground">{projectId}</p>
        </div>
        <div className="grid grid-cols-2 border border-[var(--color-border-interactive)] [border-radius:8px]">
          <PaneButton active={activePane === "chat"} onClick={() => setActivePane("chat")} label="Chat" icon={<MessageSquare className="size-4" aria-hidden="true" />} />
          <PaneButton active={activePane === "preview"} onClick={() => setActivePane("preview")} label="Preview" icon={<MonitorPlay className="size-4" aria-hidden="true" />} />
        </div>
      </header>
      <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className={`${activePane === "chat" ? "flex" : "hidden"} h-full min-h-0 flex-col lg:flex`}>
          <ChatPanel
            messages={messages}
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onStop={() => void stop()}
            onAction={(message) => void submitMessage(message)}
          />
        </div>
        <section className={`${activePane === "preview" ? "block" : "hidden"} h-full min-h-0 border-l border-border bg-[rgba(252,251,248,0.36)] lg:block`}>
          {previewFiles.length > 0 ? (
            <SandpackRunner files={previewFiles} />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-muted-foreground">
              Agent 生成 React 应用后，Sandpack 预览会在这里同步出现。
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function findLastAssistantIndex(messages: WorkspaceUiMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "assistant") return index
  }
  return -1
}

function PaneButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 px-3 text-xs ${active ? "bg-[var(--color-ink)] text-[var(--color-ink-light)]" : "text-foreground hover:bg-muted"} [border-radius:6px]`}
    >
      {icon}
      {label}
    </button>
  )
}

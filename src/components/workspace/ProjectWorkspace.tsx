"use client"

import { MessageSquare, MonitorPlay } from "lucide-react"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { PreviewPanel } from "@/components/workspace/PreviewPanel"
import { useAgentChat, type UseAgentChatOptions } from "./useAgentChat"

type ProjectWorkspaceProps = UseAgentChatOptions & {
  projectName: string
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

export function ProjectWorkspace({
  projectId,
  projectName,
  originalProblem,
  initialMessages,
  initialPreviewFiles,
}: ProjectWorkspaceProps) {
  const {
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
  } = useAgentChat({ projectId, originalProblem, initialMessages, initialPreviewFiles })

  return (
    <main className="flex h-[calc(100vh-57px)] min-h-[640px] flex-col bg-background">
      {/* Mobile pane switcher */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{projectName}</p>
          <p className="truncate text-xs text-muted-foreground">{projectId}</p>
        </div>
        <div className="grid grid-cols-2 border border-[var(--color-border-interactive)] [border-radius:8px]">
          <PaneButton
            active={activePane === "chat"}
            onClick={() => setActivePane("chat")}
            label="Chat"
            icon={<MessageSquare className="size-4" aria-hidden="true" />}
          />
          <PaneButton
            active={activePane === "preview"}
            onClick={() => setActivePane("preview")}
            label="Preview"
            icon={<MonitorPlay className="size-4" aria-hidden="true" />}
          />
        </div>
      </header>

      {/* Main content area */}
      <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[420px_minmax(0,1fr)]">
        {/* Chat panel */}
        <div className={`${activePane === "chat" ? "flex" : "hidden"} h-full min-h-0 flex-col lg:flex`}>
          <ChatPanel
            messages={messages}
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onStop={handleStop}
            onAction={(message) => {
              void submitMessage(message)
            }}
          />
        </div>

        {/* Preview panel */}
        <section
          className={`${activePane === "preview" ? "block" : "hidden"} h-full min-h-0 border-l border-border bg-[rgba(252,251,248,0.36)] lg:block`}
        >
          <PreviewPanel projectId={projectId} files={previewFiles} />
        </section>
      </div>
    </main>
  )
}

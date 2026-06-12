"use client"

import { Loader2, Send, Square } from "lucide-react"

type ChatInputProps = {
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onStop: () => void
}

export function ChatInput({ input, isLoading, onInputChange, onSubmit, onStop }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="border-t border-border p-3">
      <div className="border border-[var(--color-border-interactive)] bg-[rgba(252,251,248,0.72)] p-2 [border-radius:8px]">
        <label className="sr-only" htmlFor="chat-message">
          发送消息
        </label>
        <textarea
          id="chat-message"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          rows={3}
          placeholder="告诉 Agent 要继续、修改 Blueprint，或重新生成某个页面..."
          className="min-h-[84px] w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <p className="text-xs text-muted-foreground">Enter 发送，Shift + Enter 换行</p>
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex size-9 items-center justify-center border border-[var(--color-border-interactive)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] [border-radius:8px]"
              title="停止"
            >
              <Square className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={input.trim().length < 2}
              className="inline-flex size-9 items-center justify-center bg-primary text-primary-foreground shadow-[var(--shadow-button-gold-inset)] hover:bg-[var(--color-gold-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-40 [border-radius:8px]"
              title="发送"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

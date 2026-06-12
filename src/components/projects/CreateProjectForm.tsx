"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle, Loader2, Send } from "lucide-react"

const minProblemLength = 20

export function CreateProjectForm() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = message.trim().length >= minProblemLength && !isSubmitting

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const originalProblem = message.trim()
    if (originalProblem.length < minProblemLength) {
      setError("请至少描述 20 个字符，让 Agent 能理解业务上下文。")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalProblem }),
      })
      const payload = (await response.json()) as { project?: { id: string }; error?: string }

      if (!response.ok || !payload.project?.id) {
        throw new Error(payload.error ?? "项目创建失败")
      }

      router.push(`/projects/${payload.project.id}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "项目创建失败")
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border bg-[rgba(252,251,248,0.58)] p-2 shadow-[rgba(28,28,28,0.04)_0_16px_40px] [border-radius:8px]"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <label className="sr-only" htmlFor="business-problem">
          描述业务问题
        </label>
        <textarea
          id="business-problem"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            if (error) setError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder="描述你想解决的业务问题，例如：销售团队用 Excel 管线索，经常漏跟进，管理层也看不到转化数据。"
          rows={4}
          className="min-h-[112px] flex-1 resize-none bg-transparent px-3 py-3 text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] md:min-h-[88px]"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-primary px-4 text-sm text-primary-foreground shadow-[var(--shadow-button-gold-inset)] transition hover:bg-[var(--color-gold-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-40 [border-radius:8px]"
          title="创建项目"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
          <span>创建</span>
        </button>
      </div>
      {error ? (
        <p className="mt-2 flex items-center gap-2 px-3 text-sm text-[var(--color-error)]">
          <AlertCircle className="size-4" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </form>
  )
}

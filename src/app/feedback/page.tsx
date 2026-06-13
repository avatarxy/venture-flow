"use client"

import { CheckCircle2, MessageSquare, Send } from "lucide-react"
import { useState } from "react"

type FeedbackType = "product" | "bug" | "idea" | "other"

const feedbackTypeOptions: Array<{ value: FeedbackType; label: string }> = [
  { value: "product", label: "产品体验" },
  { value: "bug", label: "问题反馈" },
  { value: "idea", label: "功能建议" },
  { value: "other", label: "其他" },
]

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("product")
  const [contact, setContact] = useState("")
  const [content, setContent] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  function handleReset() {
    setFeedbackType("product")
    setContact("")
    setContent("")
    setSubmitted(false)
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-57px)] max-w-5xl gap-10 px-6 py-12 md:grid-cols-[0.9fr_1.1fr] md:py-16">
      <section className="space-y-5">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-[var(--color-gold-subtle)] text-[var(--color-gold)]">
          <MessageSquare className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-[var(--color-gold)]">用户反馈</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.6px]">
            帮我们把 VentureFlow 打磨得更好
          </h1>
        </div>
        <p className="text-sm leading-7 text-muted-foreground">
          你可以反馈使用中的卡点、生成结果不符合预期的地方，或任何想要的能力。
        </p>
        <div className="rounded-lg border border-border bg-[rgba(252,251,248,0.56)] p-4 text-sm leading-6 text-muted-foreground">
          我们尤其关心：业务问题是否被理解、生成产品是否完整、预览是否稳定、交互是否真的解决问题。
        </div>
      </section>

      <section className="rounded-xl border border-border bg-[rgba(252,251,248,0.7)] p-5 shadow-[var(--shadow-focus)]">
        {submitted ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-[rgba(45,125,70,0.1)] text-[var(--color-success)]">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">反馈已收到</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              感谢你的反馈。我们会尽快评估。
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 inline-flex h-10 items-center rounded-md border border-border px-4 text-sm transition hover:bg-muted"
            >
              继续提交反馈
            </button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium" htmlFor="feedback-type">
                反馈类型
              </label>
              <select
                id="feedback-type"
                value={feedbackType}
                onChange={(event) => setFeedbackType(event.target.value as FeedbackType)}
                className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-ring)]"
              >
                {feedbackTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="feedback-contact">
                联系方式
              </label>
              <input
                id="feedback-contact"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="邮箱、微信或其他联系方式（可选）"
                className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-ring)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="feedback-content">
                反馈内容
              </label>
              <textarea
                id="feedback-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
                minLength={8}
                rows={8}
                placeholder="请描述你遇到的问题、希望改进的地方，或一个你想让 VentureFlow 支持的场景。"
                className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/60 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-ring)]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)] transition hover:opacity-90"
            >
              <Send className="size-4" aria-hidden="true" />
              提交反馈
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

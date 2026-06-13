"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { AlertCircle, Loader2, Send, ArrowUpRight } from "lucide-react"
import { useTypewriterPlaceholder } from "@/components/home/useTypewriterPlaceholder"

/* ------------------------------------------------------------------ */
/* 输入提示卡片                                                        */
/* ------------------------------------------------------------------ */

const suggestionCards = [
  {
    title: "客户管理",
    desc: "线索跟进、客户转化追踪、沟通记录",
  },
  {
    title: "库存管理",
    desc: "进销存统计、库存预警、自动补货",
  },
  {
    title: "数据分析",
    desc: "自动化报表、多维度看板、趋势预测",
  },
  {
    title: "流程协同",
    desc: "工单流转、审批流程、团队任务分配",
  },
  {
    title: "财务核算",
    desc: "自动对账、费用追踪、预算管控",
  },
]

/* ------------------------------------------------------------------ */
/* 主组件                                                             */
/* ------------------------------------------------------------------ */

const minProblemLength = 20

export function HomeHero() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const placeholder = useTypewriterPlaceholder()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 从 URL query 参数读取模板预设的问题描述
  useEffect(() => {
    const problem = searchParams.get("problem")
    if (problem) {
      setMessage(decodeURIComponent(problem))
    }
  }, [searchParams])

  const canSubmit = message.trim().length >= minProblemLength && !isSubmitting

  /* 点击卡片提示填入内容 */
  function fillPrompt(text: string) {
    setMessage(text)
    setError(null)
    textareaRef.current?.focus()
  }

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
    <section className="flex flex-1 flex-col items-center justify-center gap-8 py-12 md:py-16">
      {/* ───── 标题区 ───── */}
      <div className="max-w-2xl space-y-4 text-center">
        <div className="inline-flex rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
          Problem-first AI solution builder
        </div>

        <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
          把业务问题变成
          <br />
          <span className="text-[var(--color-gold)]">可执行的产品</span>
        </h1>

        <p className="mx-auto max-w-lg text-base leading-7 text-muted-foreground md:text-lg">
          描述你的业务痛点，Venture Agent 自动完成策略分析、产品设计与应用生成，
          从想法到可运行的 Web 应用，一步到位。
        </p>
      </div>

      {/* ───── 输入区 ───── */}
      <div className="w-full max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="border border-border bg-[rgba(252,251,248,0.58)] p-2 shadow-[rgba(28,28,28,0.04)_0_16px_40px] transition focus-within:border-[var(--color-border-interactive)] focus-within:shadow-[rgba(28,28,28,0.08)_0_16px_40px] focus-within:ring-2 focus-within:ring-[var(--color-ring)] [border-radius:8px]"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <label className="sr-only" htmlFor="business-problem">
              描述业务问题
            </label>
            <textarea
              ref={textareaRef}
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
              placeholder={placeholder || "描述你想解决的业务问题……"}
              rows={4}
              className="min-h-[120px] flex-1 resize-none bg-transparent px-3 py-3 text-base leading-6 text-foreground outline-none placeholder:text-[#8c8c88] md:min-h-[100px]"
              style={{
                caretColor: "var(--color-gold)",
              }}
            />
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-primary px-4 text-sm text-primary-foreground shadow-[var(--shadow-button-gold-inset)] transition hover:bg-[var(--color-gold-hover)] disabled:cursor-not-allowed disabled:opacity-40 [border-radius:8px]"
              title="创建项目"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
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
      </div>

      {/* ───── 卡片提示 ───── */}
      <div className="w-full max-w-2xl">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          试试这些业务场景，快速开始
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {suggestionCards.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() =>
                fillPrompt(`${card.title}${card.desc.slice(0, 30)}……`)
              }
              className="group flex flex-col gap-1 rounded-lg border border-border bg-[rgba(252,251,248,0.45)] px-3.5 py-3 text-left transition hover:border-[var(--color-gold)] hover:bg-[var(--color-gold-subtle)]"
            >
              <span className="text-xs font-semibold text-foreground">{card.title}</span>
              <span className="text-[11px] leading-relaxed text-muted-foreground">
                {card.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

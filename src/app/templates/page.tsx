"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutTemplate, Search, ArrowUpRight, Users, Lightbulb, Tag, Briefcase } from "lucide-react"
import { templates, templateCategories, type TemplateEntry } from "./data"

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("全部")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = templates.filter((t) => {
    const matchCategory = activeCategory === "全部" || t.category === activeCategory
    const matchSearch =
      !searchQuery ||
      t.title.includes(searchQuery) ||
      t.description.includes(searchQuery) ||
      t.tags.some((tag) => tag.includes(searchQuery))
    return matchCategory && matchSearch
  })

  const categoryCounts: Record<string, number> = { 全部: templates.length }
  for (const cat of templateCategories.slice(1)) {
    categoryCounts[cat] = templates.filter((t) => t.category === cat).length
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* ── Hero ── */}
      <section className="mb-10 space-y-4 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
          <LayoutTemplate className="size-3" aria-hidden="true" />
          模板库 · 一键开始
        </div>
        <h1 className="text-4xl font-semibold leading-[1.15] tracking-[-0.9px] md:text-5xl">
          产品 <span className="text-[var(--color-gold)]">模板</span>
        </h1>
        <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">
          12 个精心设计的业务场景模板，选择一个贴近你需求的，秒级生成可运行的应用原型。
        </p>

        {/* 搜索 */}
        <div className="relative mx-auto mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索模板……"
            className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
        </div>
      </section>

      {/* ── 分类筛选 ── */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {templateCategories.map((cat) => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                isActive
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-ink-light)]"
                  : "border-border bg-[rgba(252,251,248,0.45)] text-muted-foreground hover:border-[var(--color-border-interactive)] hover:text-foreground"
              }`}
            >
              {cat}
              <span className={`tabular-nums ${isActive ? "text-[var(--color-ink-light)]/60" : "text-muted-foreground/50"}`}>
                {categoryCounts[cat]}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── 模板卡片网格 ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Lightbulb className="mx-auto mb-3 size-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">没有找到匹配的模板，试试换个关键词。</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}

      {/* ── 底部提示 ── */}
      <section className="mt-16 rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-6 text-center">
        <p className="text-sm text-muted-foreground">
          模板只是起点——每个模板生成后，你都可以在对话中继续修改、
          调整实体和页面、添加你的专属需求。没有固定模板，只有灵活起点。
        </p>
      </section>
    </main>
  )
}

/* ──────────────────────────────────────────────────────────────── */
/* 模板卡片组件                                                      */
/* ──────────────────────────────────────────────────────────────── */

function TemplateCard({ template }: { template: TemplateEntry }) {
  const [imgError, setImgError] = useState(false)

  const useUrl = `/?problem=${encodeURIComponent(template.problem)}`

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-[rgba(252,251,248,0.45)] transition hover:border-[var(--color-border-interactive)] hover:shadow-[rgba(28,28,28,0.04)_0_8px_24px]">
      {/* ── 产品截图 ── */}
      <div className="relative aspect-[3/2] overflow-hidden border-b border-border bg-[rgba(28,28,28,0.02)]">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center bg-[rgba(28,28,28,0.03)]">
            <LayoutTemplate className="size-8 text-muted-foreground/20" />
          </div>
        ) : (
          <img
            src={template.imageUrl}
            alt={template.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {/* 悬停遮罩 + 使用按钮 */}
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(28,28,28,0.35)] opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Link
            href={useUrl}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-gold)] px-4 py-2 text-sm font-medium text-[var(--color-ink-light)] shadow-[var(--shadow-button-gold-inset)] transition hover:bg-[var(--color-gold-hover)]"
          >
            使用此模板
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 卡片内容 ── */}
      <div className="flex flex-1 flex-col p-4">
        {/* 标签 */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-[var(--color-gold-subtle)] px-2 py-0.5 text-[10px] text-[var(--color-gold)]"
            >
              <Tag className="mr-0.5 inline size-2.5" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>

        {/* 标题 + 描述 */}
        <h3 className="text-base font-semibold leading-snug">{template.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {template.description}
        </p>

        {/* 用户画像 */}
        <div className="mt-3 flex items-start gap-1.5 rounded-md bg-[var(--color-ink-04)] px-2.5 py-2">
          <Users className="mt-0.5 size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="text-[11px] leading-relaxed text-muted-foreground">{template.userPersona}</span>
        </div>

        {/* 解决的问题 */}
        <div className="mt-2 flex items-start gap-1.5">
          <Briefcase className="mt-0.5 size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
            {template.problem.slice(0, 80)}……
          </span>
        </div>

        {/* ── 底部操作 ── */}
        <div className="mt-auto pt-4">
          <Link
            href={useUrl}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border-interactive)] bg-transparent px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-[var(--color-ink-04)] hover:text-foreground"
          >
            使用模板
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </article>
  )
}

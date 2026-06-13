import { BookMarked, Clock, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import { manualEntries, getManualCategoryEntries } from "./data"

export default function ManualPage() {
  const categories = getManualCategoryEntries()

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* ── Hero ── */}
      <section className="mb-12 space-y-4 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
          <BookMarked className="size-3" aria-hidden="true" />
          指南 · 操作 · 技巧
        </div>
        <h1 className="text-4xl font-semibold leading-[1.15] tracking-[-0.9px] md:text-5xl">
          VentureFlow <span className="text-[var(--color-gold)]">使用手册</span>
        </h1>
        <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">
          从零开始了解产品的每一项功能，给使用者的操作指南。
        </p>
      </section>

      {/* ── 按分类排列手册卡片 ── */}
      <div className="space-y-12">
        {Object.entries(categories).map(([category, entries]) => (
          <section key={category}>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {entries.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/manual/${doc.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-5 transition hover:border-[var(--color-border-interactive)] hover:shadow-[rgba(28,28,28,0.04)_0_8px_24px]"
                >
                  <h3 className="text-base font-semibold leading-snug transition group-hover:text-[var(--color-gold)]">
                    {doc.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {doc.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" aria-hidden="true" />
                      {doc.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition group-hover:text-foreground">
                      阅读
                      <ChevronRight className="size-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── 快速导航 ── */}
      <section className="mt-16 rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-6 md:p-8">
        <h2 className="mb-4 text-lg font-semibold">全部章节</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {manualEntries.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/manual/${doc.slug}`}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-[var(--color-gold-subtle)] hover:text-foreground"
              >
                <span className="text-[10px] tabular-nums text-[var(--color-gold)]">
                  {String(doc.order).padStart(2, "0")}
                </span>
                <span className="flex-1 truncate">{doc.title}</span>
                <ChevronRight className="size-3 shrink-0 opacity-40" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── CTA ── */}
      <section className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          需要了解技术实现细节？查看 <Link href="/docs" className="text-[var(--color-gold)] underline underline-offset-2 transition hover:text-[var(--color-gold-hover)]">开发文档</Link>。
        </p>
        <Link
          href="/manual/quick-start"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)] transition hover:opacity-90"
        >
          快速上手
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  )
}

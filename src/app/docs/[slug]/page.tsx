import { notFound } from "next/navigation"
import { getDocEntry } from "../data"
import { getDocContent } from "./content"
import { DocArticle } from "@/components/docs/DocArticle"
import { DocSidebar } from "@/components/docs/DocSidebar"
import { DocTOC } from "@/components/docs/DocTOC"
import { ChevronRight, ArrowLeft, BookOpen, Clock } from "lucide-react"
import Link from "next/link"
import { docEntries } from "../data"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function DocDetailPage({ params }: Props) {
  const { slug } = await params
  const entry = getDocEntry(slug)
  if (!entry) notFound()

  const doc = getDocContent(slug)
  const currentIndex = docEntries.findIndex((d) => d.slug === slug)
  const prevDoc = currentIndex > 0 ? docEntries[currentIndex - 1] : null
  const nextDoc = currentIndex < docEntries.length - 1 ? docEntries[currentIndex + 1] : null

  return (
    <>
      {/* ── 移动端面包屑 ── */}
      <div className="sticky top-14 z-30 border-b border-border bg-[var(--color-page)]/90 px-4 py-2 backdrop-blur-md lg:hidden">
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link href="/docs" className="transition hover:text-foreground">
            Docs
          </Link>
          <ChevronRight className="size-3" />
          <span className="truncate text-foreground">{entry.title}</span>
        </nav>
      </div>

      {/* ── 三栏布局 ── */}
      <div className="mx-auto max-w-[1440px]">
        <div className="lg:grid lg:grid-cols-[280px_1fr_200px] lg:gap-0">
          {/* ═══ 左侧 Wiki 目录 ═══ */}
          <DocSidebar
            entries={docEntries}
            currentSlug={slug}
            sections={doc?.sections ?? []}
          />

          {/* ═══ 中间文章正文 ═══ */}
          <main className="min-w-0 px-4 py-8 md:px-8 md:py-10 lg:px-10">
            {/* 桌面端面包屑 */}
            <nav className="mb-6 hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
              <Link href="/docs" className="transition hover:text-foreground">
                Docs
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-foreground">{entry.title}</span>
            </nav>

            {/* 标题区 */}
            <header className="mb-8">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                <BookOpen className="size-3" aria-hidden="true" />
                {entry.category}
                <span className="mx-0.5 opacity-30">·</span>
                <Clock className="size-3" aria-hidden="true" />
                {entry.readTime}
              </div>
              <h1 className="text-3xl font-semibold leading-[1.15] tracking-[-0.6px] md:text-4xl">
                {entry.title}
              </h1>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">
                {entry.description}
              </p>
            </header>

            {/* 文章内容 */}
            {doc ? (
              <DocArticle content={doc.content} />
            ) : (
              <div className="rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-8 text-center">
                <p className="text-sm text-muted-foreground">该文档内容正在编写中。</p>
              </div>
            )}

            {/* ── 前后篇导航 ── */}
            <footer className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between">
              {prevDoc ? (
                <Link
                  href={`/docs/${prevDoc.slug}`}
                  className="group flex items-start gap-3 rounded-lg p-3 transition hover:bg-[var(--color-gold-subtle)]"
                >
                  <ArrowLeft className="mt-0.5 size-4 shrink-0 text-muted-foreground transition group-hover:text-[var(--color-gold)]" />
                  <div>
                    <span className="text-[11px] text-muted-foreground">上一篇</span>
                    <p className="text-sm font-medium">{prevDoc.title}</p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextDoc ? (
                <Link
                  href={`/docs/${nextDoc.slug}`}
                  className="group flex items-start gap-3 rounded-lg p-3 text-right transition hover:bg-[var(--color-gold-subtle)] sm:ml-auto"
                >
                  <div>
                    <span className="text-[11px] text-muted-foreground">下一篇</span>
                    <p className="text-sm font-medium">{nextDoc.title}</p>
                  </div>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition group-hover:text-[var(--color-gold)]" />
                </Link>
              ) : (
                <div />
              )}
            </footer>
          </main>

          {/* ═══ 右侧 TOC 目录树 ═══ */}
          {doc?.sections && doc.sections.length > 0 && (
            <div className="hidden lg:block">
              <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-l border-border px-4 py-6">
                <DocTOC sections={doc.sections} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export function generateStaticParams() {
  return docEntries.map((entry) => ({ slug: entry.slug }))
}

export const dynamicParams = false

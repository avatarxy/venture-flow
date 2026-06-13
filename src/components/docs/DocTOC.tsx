"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronRight, ListTree } from "lucide-react"
import type { DocSection } from "@/app/docs/data"

type Props = {
  sections: DocSection[]
}

export function DocTOC({ sections }: Props) {
  const [activeId, setActiveId] = useState<string>("")
  const [mobileOpen, setMobileOpen] = useState(false)

  if (sections.length === 0) return null

  // 监听滚动，高亮当前可见标题
  const handleScroll = useCallback(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[]

    // 从最后一个开始，找第一个进入视口的
    for (let i = headings.length - 1; i >= 0; i--) {
      const el = headings[i]
      const rect = el.getBoundingClientRect()
      if (rect.top <= 100) {
        setActiveId(sections[i].id)
        return
      }
    }
    if (sections.length > 0) setActiveId(sections[0].id)
  }, [sections])

  useEffect(() => {
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return (
    <>
      {/* ── 移动端浮动 TOC 按钮 ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-5 left-5 z-50 flex size-11 items-center justify-center rounded-full border border-[var(--color-border-interactive)] bg-[var(--color-page)] shadow-[var(--shadow-focus)] lg:hidden"
        aria-label="目录树"
      >
        {mobileOpen ? <ChevronRight className="size-4 rotate-90" /> : <ListTree className="size-4" />}
      </button>

      {/* ── 移动端 TOC 抽屉 ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[rgba(28,28,28,0.2)] backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-40 w-[260px] overflow-y-auto border-l border-border bg-[var(--color-page)] p-5 pt-16 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                页内目录
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <TOCList sections={sections} activeId={activeId} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* ── 桌面端 TOC — 粘性右侧栏 ── */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          {/* 标题 */}
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            页内目录
          </span>

          <TOCList sections={sections} activeId={activeId} />

          {/* 底部回到顶部 */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-6 rounded-md px-2 py-1 text-[11px] text-muted-foreground/50 transition hover:text-muted-foreground"
          >
            ↑ 回到顶部
          </button>
        </div>
      </aside>
    </>
  )
}

/* ── TOC 列表子组件 ─────────────────────────────────────────────── */

function TOCList({
  sections,
  activeId,
  onNavigate,
}: {
  sections: DocSection[]
  activeId: string
  onNavigate?: () => void
}) {
  return (
    <nav className="mt-3">
      <ul className="space-y-0">
        {sections.map((section) => {
          const isActive = activeId === section.id
          const isH3 = section.level === 3

          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={onNavigate}
                className={`block rounded-md py-1 text-[12px] leading-snug transition-all ${
                  isH3 ? "pl-3" : ""
                } ${
                  isActive
                    ? "font-medium text-[var(--color-gold)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {/* 活跃指示线 — Notion 风格 */}
                <span className="relative">
                  {isActive && (
                    <span className="absolute -left-2 top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-[var(--color-gold)]" />
                  )}
                  {section.title}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

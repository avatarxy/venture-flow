"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ChevronRight, X, List, BookMarked } from "lucide-react"
import type { ManualEntry, ManualSection } from "@/app/manual/data"

type Props = {
  entries: ManualEntry[]
  currentSlug: string
  sections: ManualSection[]
}

export function ManualSidebar({ entries, currentSlug, sections: _sections }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const sidebarRef = useRef<HTMLElement>(null)

  const categories = ["入门", "功能指南", "进阶"]
  const categoryEntries: Record<string, ManualEntry[]> = {}
  for (const e of entries) {
    if (!categoryEntries[e.category]) categoryEntries[e.category] = []
    categoryEntries[e.category].push(e)
  }

  const currentEntry = entries.find((e) => e.slug === currentSlug)
  useEffect(() => {
    if (currentEntry) {
      setCollapsed((prev) => ({ ...prev, [currentEntry.category]: true }))
    }
  }, [currentEntry])

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const handleLinkClick = useCallback(() => setMobileOpen(false), [])

  const wikiTree = (
    <nav className="flex flex-col gap-0.5">
      <Link
        href="/manual"
        onClick={handleLinkClick}
        className="group flex items-center gap-2 rounded-md px-3 py-2 text-[13px] transition hover:bg-[var(--color-ink-04)]"
      >
        <BookMarked className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground">使用手册首页</span>
      </Link>

      <div className="my-2 border-t border-border" />

      {categories.map((cat) => {
        const docs = categoryEntries[cat]
        if (!docs?.length) return null
        const isExpanded = collapsed[cat] !== false

        return (
          <div key={cat} className="mb-0.5">
            <button
              type="button"
              onClick={() => toggleCategory(cat)}
              className="flex w-full items-center gap-1.5 rounded-md px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 transition hover:text-muted-foreground"
            >
              <span className={`flex size-4 shrink-0 items-center justify-center transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                <ChevronRight className="size-3" />
              </span>
              {cat}
            </button>

            <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
              <ul className="mt-0.5 space-y-0">
                {docs.map((doc) => {
                  const isActive = doc.slug === currentSlug
                  return (
                    <li key={doc.slug}>
                      <Link
                        href={`/manual/${doc.slug}`}
                        onClick={handleLinkClick}
                        className={`group flex items-center gap-2 rounded-md px-3 py-1.5 pl-7 text-[13px] leading-snug transition ${
                          isActive
                            ? "bg-[var(--color-gold-subtle)] font-medium text-[var(--color-gold)]"
                            : "text-muted-foreground hover:bg-[var(--color-ink-04)] hover:text-foreground"
                        }`}
                      >
                        <span className={`shrink-0 text-[10px] tabular-nums ${isActive ? "text-[var(--color-gold)]" : "text-muted-foreground/40"}`}>
                          {String(doc.order).padStart(2, "0")}
                        </span>
                        <span className="truncate">{doc.title}</span>
                        {isActive && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-[var(--color-gold)]" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )
      })}
    </nav>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-5 right-5 z-50 flex size-11 items-center justify-center rounded-full border border-[var(--color-border-interactive)] bg-[var(--color-page)] shadow-[var(--shadow-focus)] lg:hidden"
        aria-label="手册目录"
      >
        {mobileOpen ? <X className="size-4" /> : <List className="size-4" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[rgba(28,28,28,0.2)] backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 w-[280px] overflow-y-auto border-r border-border bg-[var(--color-page)] px-4 py-5 transition-transform lg:sticky lg:top-16 lg:z-0 lg:block lg:h-[calc(100vh-64px)] lg:w-auto lg:translate-x-0 lg:overflow-y-auto lg:border-r lg:border-border lg:bg-transparent lg:px-3 lg:py-0 ${
          mobileOpen ? "translate-x-0 pt-16" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold">使用手册</span>
          <button type="button" onClick={() => setMobileOpen(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        {wikiTree}
      </aside>
    </>
  )
}

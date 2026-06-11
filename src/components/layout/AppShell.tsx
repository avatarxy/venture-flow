import type { ReactNode } from "react"
import Link from "next/link"
import { LayoutDashboard, Sparkles } from "lucide-react"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link className="flex items-center gap-2 text-sm font-semibold" href="/">
            <span className="flex size-8 items-center justify-center rounded-md bg-[var(--color-ink)] text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)]">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            VentureFlow
          </Link>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted" href="/projects">
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Projects
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}

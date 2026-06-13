import Link from "next/link"
import { Sparkles } from "lucide-react"

type FooterColumn = {
  title: string
  links: { label: string; href: string }[]
}

const columns: FooterColumn[] = [
  {
    title: "产品",
    links: [
      { label: "模板", href: "/templates" },
      { label: "定价", href: "/pricing" },
      { label: "需求广场", href: "/marketplace/briefs" },
    ],
  },
  {
    title: "资源",
    links: [
      { label: "使用手册", href: "/manual" },
      { label: "开发文档", href: "/docs" },
      { label: "博客", href: "/blog" },
    ],
  },
  {
    title: "公司",
    links: [
      { label: "关于", href: "/about" },
      { label: "隐私政策", href: "/privacy" },
      { label: "服务条款", href: "/terms" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-[rgba(252,251,248,0.45)]">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── Logo + 简介 ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link className="inline-flex items-center gap-2 text-sm font-semibold" href="/">
              <span className="flex size-8 items-center justify-center rounded-md bg-[var(--color-ink)] text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)]">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              VentureFlow
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              把业务问题变成可执行的产品。AI Agent 从分析到编码，一条完整闭环。
            </p>
          </div>

          {/* ── 链接列 ── */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── 底部 ── */}
        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} VentureFlow. 问题驱动，AI 落地。
        </div>
      </div>
    </footer>
  )
}

"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  Sparkles,
  ChevronDown,
  Store,
  BookOpen,
  BookMarked,
  FileText,
  Lightbulb,
  UserPlus,
  LogIn,
  Settings,
  Shield,
  Cpu,
  Puzzle,
  Plug,
  Database,
  Tag,
  FolderOpen,
  Loader2,
  ArrowUpRight,
  Clock,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Dropdown 子组件                                                    */
/* ------------------------------------------------------------------ */

type DropdownItem = {
  label: string
  href?: string
  icon?: ReactNode
  desc?: string
}

function DropdownMenu({
  items,
  isOpen,
  onClose,
}: {
  items: DropdownItem[]
  isOpen: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-lg border border-border bg-[var(--color-page)] p-1.5 shadow-[var(--shadow-focus)]"
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href ?? "#"}
          onClick={onClose}
          className="flex items-start gap-3 rounded-md px-3 py-2.5 text-sm transition hover:bg-[var(--color-gold-subtle)]"
        >
          {item.icon ? (
            <span className="mt-0.5 shrink-0 text-[var(--color-muted)]">{item.icon}</span>
          ) : null}
          <div>
            <p className="font-medium text-foreground">{item.label}</p>
            {item.desc ? (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 项目下拉 — 异步加载列表                                            */
/* ------------------------------------------------------------------ */

type ProjectSummary = {
  id: string
  name: string
  status: string
  originalProblem: string
  updatedAt: string
}

const statusLabels: Record<string, string> = {
  DRAFT: "草稿",
  BLUEPRINT: "蓝图",
  BUILDING: "生成中",
  READY: "就绪",
  REVIEW: "审核中",
  REPAIR: "修复中",
  IMPROVING: "优化中",
  FAILED: "失败",
}

function ProjectsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  /* 点击外部关闭 */
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen])

  /* 打开时加载项目列表 */
  const handleToggle = useCallback(async () => {
    if (!isOpen) {
      setIsOpen(true)
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/projects")
        const data = (await res.json()) as { projects?: ProjectSummary[]; error?: string }
        if (!res.ok || !data.projects) throw new Error(data.error ?? "加载失败")
        setProjects(data.projects)
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败")
      } finally {
        setLoading(false)
      }
    } else {
      setIsOpen(false)
    }
  }, [isOpen])

  function formatTime(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60_000) return "刚刚"
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
    return `${Math.floor(diff / 86_400_000)} 天前`
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <FolderOpen className="size-4" aria-hidden="true" />
        项目
        <ChevronDown
          className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[360px] max-h-[420px] overflow-y-auto rounded-lg border border-border bg-[var(--color-page)] p-1.5 shadow-[var(--shadow-focus)]">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              加载中……
            </div>
          ) : error ? (
            <div className="px-3 py-4 text-sm text-[var(--color-error)]">{error}</div>
          ) : projects.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              还没有项目，在首页输入业务问题开始创建。
            </div>
          ) : (
            <div className="space-y-0.5">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 rounded-md px-3 py-2.5 transition hover:bg-[var(--color-gold-subtle)]"
                >
                  <FolderOpen className="mt-0.5 size-4 shrink-0 text-[var(--color-muted)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                      <span className="shrink-0 rounded border border-border px-1.5 py-0 text-[10px] text-muted-foreground">
                        {statusLabels[p.status] ?? p.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {p.originalProblem.slice(0, 50)}{p.originalProblem.length > 50 ? "……" : ""}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      {formatTime(p.updatedAt)}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 菜单数据                                                           */
/* ------------------------------------------------------------------ */

const tradingHallItems: DropdownItem[] = [
  {
    label: "需求广场",
    href: "/marketplace/briefs",
    icon: <Lightbulb className="size-4" />,
    desc: "发布业务需求，匹配合适的解决方案",
  },
  {
    label: "产品集市",
    href: "/marketplace/products",
    icon: <Store className="size-4" />,
    desc: "浏览和采购已上架的 AI 应用产品",
  },
]

const resourceItems: DropdownItem[] = [
  {
    label: "使用手册",
    href: "/manual",
    icon: <BookMarked className="size-4" />,
    desc: "产品功能介绍与操作指南",
  },
  {
    label: "博客",
    href: "/blog",
    icon: <BookOpen className="size-4" />,
    desc: "产品更新、行业洞察与最佳实践",
  },
  {
    label: "文档",
    href: "/docs",
    icon: <FileText className="size-4" />,
    desc: "技术架构与开发文档",
  },
  {
    label: "模板",
    href: "/templates",
    icon: <Lightbulb className="size-4" />,
    desc: "浏览产品模板，一键开始创建",
  },
]

const configItems: DropdownItem[] = [
  {
    label: "角色",
    href: "/settings/roles",
    icon: <Shield className="size-4" />,
    desc: "管理 Agent 角色与权限",
  },
  {
    label: "模型",
    href: "/settings/models",
    icon: <Cpu className="size-4" />,
    desc: "选择和配置 AI 模型",
  },
  {
    label: "技能",
    href: "/settings/skills",
    icon: <Puzzle className="size-4" />,
    desc: "扩展 Agent 的专业能力",
  },
  {
    label: "连接器",
    href: "/settings/connectors",
    icon: <Plug className="size-4" />,
    desc: "接入三方数据源（MCP）",
  },
  {
    label: "知识库",
    href: "/settings/knowledge",
    icon: <Database className="size-4" />,
    desc: "管理领域知识与上下文",
  },
]

/* ------------------------------------------------------------------ */
/* 主组件                                                             */
/* ------------------------------------------------------------------ */

function NavDropdown({
  label,
  items,
}: {
  label: string
  items: DropdownItem[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        {label}
        <ChevronDown
          className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <DropdownMenu items={items} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith("/preview")) {
    return children
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ───── 顶部导航栏：左对齐 LOGO + 主菜单，右侧用户操作 ───── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          {/* 左侧：LOGO + 导航 */}
          <nav className="flex items-center gap-1">
            <Link className="flex items-center gap-2 text-sm font-semibold mr-6" href="/">
              <span className="flex size-8 items-center justify-center rounded-md bg-[var(--color-ink)] text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)]">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              VentureFlow
            </Link>

            <ProjectsDropdown />

            <Link
              href="/pricing"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Tag className="mr-1.5 inline size-3.5" aria-hidden="true" />
              定价
            </Link>

            <NavDropdown label="交易大厅" items={tradingHallItems} />
            <NavDropdown label="资源" items={resourceItems} />
          </nav>

          {/* 右侧：用户操作 */}
          <nav className="flex items-center gap-1">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <UserPlus className="size-4" aria-hidden="true" />
              注册
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <LogIn className="size-4" aria-hidden="true" />
              登录
            </Link>
            <NavDropdown label="配置" items={configItems} />
          </nav>
        </div>
      </header>

      {children}
    </div>
  )
}

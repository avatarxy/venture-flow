"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { Footer } from "@/components/layout/Footer"
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
  LogOut,
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
  User,
  MessageSquare,
  Home,
  Menu,
  X,
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
/* ── 用户下拉 ── */

type UserInfo = { email: string; name: string }

function UserDropdown({ user, onLogout }: { user: UserInfo; onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-gold-subtle)] text-[var(--color-gold)]">
          <User className="size-3.5" />
        </span>
        <span className="hidden max-w-[100px] truncate text-muted-foreground md:inline">
          {user.name}
        </span>
        <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-lg border border-border bg-[var(--color-page)] p-1.5 shadow-[var(--shadow-focus)]">
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
          </div>
          <div className="mt-1 space-y-0.5">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <User className="size-4" />
              个人中心
            </Link>
            <button
              type="button"
              onClick={() => { setIsOpen(false); onLogout() }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--color-error)] transition hover:bg-[rgba(194,59,59,0.04)]"
            >
              <LogOut className="size-4" />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (pathname.startsWith("/preview")) {
    return children
  }

  async function handleLogout() {
    await logout()
    router.push("/")
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ───── 顶部导航栏 ───── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          {/* 左侧：Logo + 主导航 */}
          <div className="flex items-center gap-1">
            <Link className="flex shrink-0 items-center gap-2 text-sm font-semibold mr-4" href="/">
              <span className="flex size-8 items-center justify-center rounded-md bg-[var(--color-ink)] text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)]">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <span className="hidden sm:inline">VentureFlow</span>
            </Link>

            {/* 桌面端导航 — 左对齐在 Logo 右侧 */}
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Home className="mr-1.5 inline size-3.5" aria-hidden="true" />
                首页
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
          </div>

          {/* 右侧：用户操作 + 汉堡菜单 */}
          <div className="flex items-center gap-1">
            {/* 桌面端用户操作 */}
            <div className="hidden items-center gap-1 md:flex">
              {loading ? (
                <div className="size-8 animate-pulse rounded-md bg-muted" />
              ) : user ? (
                <UserDropdown user={user} onLogout={handleLogout} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    注册
                  </Link>
                </>
              )}
              <Link
                href="/feedback"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <MessageSquare className="size-4" aria-hidden="true" />
                反馈
              </Link>
            </div>

            {/* 移动端汉堡菜单按钮 */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
              aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ───── 移动端菜单抽屉 ───── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[rgba(28,28,28,0.2)] backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-40 w-[280px] overflow-y-auto border-l border-border bg-[var(--color-page)] p-5 pt-20 md:hidden">
            <nav className="flex flex-col gap-1">
              {/* Logo */}
              <div className="mb-4 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-[var(--color-ink)] text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)]">
                  <Sparkles className="size-4" />
                </span>
                <span className="text-sm font-semibold">VentureFlow</span>
              </div>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Home className="size-4" />
                首页
              </Link>

              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <FolderOpen className="size-4" />
                项目
              </Link>

              <div className="my-2 border-t border-border" />

              {/* 交易大厅 */}
              <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                交易大厅
              </span>
              {tradingHallItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href ?? "#"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-start gap-3 rounded-md px-3 py-2.5 text-sm transition hover:bg-muted"
                >
                  <span className="mt-0.5 text-muted-foreground">{item.icon}</span>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    {item.desc ? (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                    ) : null}
                  </div>
                </Link>
              ))}

              <div className="my-2 border-t border-border" />

              {/* 资源 */}
              <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                资源
              </span>
              {resourceItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href ?? "#"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-start gap-3 rounded-md px-3 py-2.5 text-sm transition hover:bg-muted"
                >
                  <span className="mt-0.5 text-muted-foreground">{item.icon}</span>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    {item.desc ? (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                    ) : null}
                  </div>
                </Link>
              ))}

              <div className="my-2 border-t border-border" />

              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Tag className="size-4" />
                定价
              </Link>

              <Link
                href="/feedback"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <MessageSquare className="size-4" />
                反馈
              </Link>

              <div className="my-2 border-t border-border" />

              {/* 用户 */}
              {user ? (
                <>
                  <div className="px-3 py-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <User className="size-4" />
                    个人中心
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[var(--color-error)] transition hover:bg-[rgba(194,59,59,0.04)]"
                  >
                    <LogOut className="size-4" />
                    退出登录
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-md bg-[var(--color-ink)] px-3 py-2 text-center text-sm text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)] transition hover:opacity-90"
                  >
                    注册
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}

      {children}

      {/* Footer — 项目工作台和预览页不显示 */}
      {!pathname.startsWith("/projects") && !pathname.startsWith("/preview") && <Footer />}
    </div>
  )
}

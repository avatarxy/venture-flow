"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, LogOut, ArrowLeft, Shield } from "lucide-react"
import { useAuth } from "@/components/auth/AuthContext"
import { useEffect } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-61px)] max-w-md flex-col justify-center px-6 py-12">
        <div className="flex items-center justify-center py-24">
          <div className="size-8 animate-spin rounded-full border-2 border-border border-t-[var(--color-gold)]" />
        </div>
      </main>
    )
  }

  if (!user) return null

  async function handleLogout() {
    await logout()
    router.push("/")
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        返回首页
      </Link>

      {/* ── 用户信息卡片 ── */}
      <div className="rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-gold-subtle)]">
            <User className="size-6 text-[var(--color-gold)]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* ── 操作区 ── */}
      <div className="mt-6 space-y-2">
        <Link
          href="/projects"
          className="flex items-center gap-3 rounded-lg border border-border bg-[rgba(252,251,248,0.45)] px-4 py-3 text-sm transition hover:border-[var(--color-border-interactive)] hover:bg-[var(--color-ink-04)]"
        >
          <Shield className="size-4 text-muted-foreground" />
          我的项目
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-[rgba(252,251,248,0.45)] px-4 py-3 text-sm text-[var(--color-error)] transition hover:border-[var(--color-error)] hover:bg-[rgba(194,59,59,0.04)]"
        >
          <LogOut className="size-4" />
          退出登录
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        账号创建于 VF Cloud · 数据安全加密存储
      </p>
    </main>
  )
}

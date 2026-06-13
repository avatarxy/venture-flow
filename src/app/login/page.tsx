"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Lock, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace("/profile")
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError("请填写邮箱和密码")
      return
    }
    setLoading(true)
    setError("")
    const result = await login(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      router.push("/profile")
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-61px)] max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        返回首页
      </Link>

      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.6px]">
          登录 VentureFlow
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          欢迎回来，继续你的项目
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
            邮箱
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:border-[var(--color-border-interactive)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">
            密码
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              autoComplete="current-password"
              className="h-11 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:border-[var(--color-border-interactive)]"
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg bg-[rgba(194,59,59,0.06)] px-3 py-2 text-sm text-[var(--color-error)]">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-ink)] text-sm font-medium text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)] transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {loading ? "登录中……" : "登录"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        还没有账号？{" "}
        <Link href="/register" className="font-medium text-[var(--color-gold)] transition hover:text-[var(--color-gold-hover)]">
          立即注册
        </Link>
      </p>
    </main>
  )
}

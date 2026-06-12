"use client"

import type { ReactNode } from "react"

type MessageCardProps = {
  title: string
  tone?: "neutral" | "gold" | "success" | "error" | "info"
  children: ReactNode
}

const toneClassName = {
  neutral: "border-border",
  gold: "border-[var(--color-gold)] bg-[var(--color-gold-subtle)]",
  success: "border-[var(--color-success)] bg-[rgba(45,125,70,0.06)]",
  error: "border-[var(--color-error)] bg-[rgba(194,59,59,0.06)]",
  info: "border-[var(--color-info)] bg-[rgba(59,111,170,0.06)]",
}

export function MessageCard({ title, tone = "neutral", children }: MessageCardProps) {
  return (
    <article className={`border p-4 ${toneClassName[tone]} [border-radius:8px]`}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </article>
  )
}

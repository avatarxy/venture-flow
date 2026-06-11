# Workspace UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现项目首页、Workspace 三栏布局、Agent Timeline、Strategy、Blueprint、Preview、Analytics 和 Build Inspector 的主界面。

**Architecture:** 页面通过 Server Components 加载项目数据，交互区域使用 Client Components。UI 保持工具型、紧凑、可扫描。

**Tech Stack:** Next.js App Router、React、Tailwind CSS、shadcn/ui、lucide-react。

---

## 文件结构

```text
src/app/page.tsx
src/app/projects/page.tsx
src/app/projects/[projectId]/page.tsx
src/components/workspace/WorkspaceShell.tsx
src/components/workspace/AgentTimeline.tsx
src/components/workspace/StrategyPanel.tsx
src/components/workspace/BlueprintPanel.tsx
src/components/workspace/PreviewPanel.tsx
src/components/workspace/AnalyticsPanel.tsx
src/components/workspace/BuildInspector.tsx
src/components/workspace/VersionPanel.tsx
src/components/projects/CreateProjectForm.tsx
src/components/projects/RecentProjects.tsx
```

## Task 1: 实现首页创建项目入口

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/projects/CreateProjectForm.tsx`
- Create: `src/app/api/projects/route.ts`

- [ ] **Step 1: 写创建项目 API**

```ts
import { NextResponse } from "next/server"
import { createProject } from "@/server/projects/project-repository"

export async function POST(request: Request) {
  const body = await request.json()
  const project = await createProject(String(body.originalProblem ?? ""))

  return NextResponse.json({ project })
}
```

- [ ] **Step 2: 写创建表单**

```tsx
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function CreateProjectForm() {
  const router = useRouter()
  const [originalProblem, setOriginalProblem] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalProblem }),
    })
    const payload = await response.json()
    router.push(`/projects/${payload.project.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={originalProblem}
        onChange={(event) => setOriginalProblem(event.target.value)}
        className="min-h-32 w-full rounded-md border border-border p-3 text-sm"
        placeholder="你正在尝试解决什么业务问题？"
      />
      <button disabled={isSubmitting || originalProblem.length < 20} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
        创建项目
      </button>
    </form>
  )
}
```

- [ ] **Step 3: 接入首页**

```tsx
import { CreateProjectForm } from "@/components/projects/CreateProjectForm"

export default function HomePage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-8 px-6 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-normal">VentureFlow</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          描述业务问题，让 AI 设计、构建并改进解决方案。
        </p>
      </section>
      <CreateProjectForm />
    </main>
  )
}
```

- [ ] **Step 4: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 2: 实现 Workspace Shell

**Files:**
- Modify: `src/app/projects/[projectId]/page.tsx`
- Create: `src/components/workspace/WorkspaceShell.tsx`

- [ ] **Step 1: 写 WorkspaceShell**

```tsx
import type { ReactNode } from "react"

export function WorkspaceShell({
  timeline,
  main,
  inspector,
}: {
  timeline: ReactNode
  main: ReactNode
  inspector: ReactNode
}) {
  return (
    <main className="grid min-h-[calc(100vh-57px)] grid-cols-[280px_minmax(0,1fr)_360px]">
      <aside className="border-r border-border bg-muted/30 p-4">{timeline}</aside>
      <section className="min-w-0 p-5">{main}</section>
      <aside className="border-l border-border bg-muted/20 p-4">{inspector}</aside>
    </main>
  )
}
```

- [ ] **Step 2: 接入项目页**

```tsx
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell"
import { AgentTimeline } from "@/components/workspace/AgentTimeline"
import { BuildInspector } from "@/components/workspace/BuildInspector"
import { StrategyPanel } from "@/components/workspace/StrategyPanel"
import { getProject } from "@/server/projects/project-repository"

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    return <main className="p-6">Project not found</main>
  }

  return (
    <WorkspaceShell
      timeline={<AgentTimeline agentState={project.agentState} />}
      main={<StrategyPanel strategy={project.strategy} />}
      inspector={<BuildInspector versions={project.versions} />}
    />
  )
}
```

- [ ] **Step 3: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 3: 实现 Agent Timeline

**Files:**
- Create: `src/components/workspace/AgentTimeline.tsx`

- [ ] **Step 1: 写 Timeline 组件**

```tsx
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"

type TimelineStep = {
  title: string
  status: "pending" | "running" | "completed" | "failed"
}

export function AgentTimeline({ agentState }: { agentState: { currentPlan?: unknown } | null }) {
  const steps = Array.isArray(agentState?.currentPlan) ? (agentState.currentPlan as TimelineStep[]) : []

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Agent Timeline</h2>
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.status === "completed" ? CheckCircle2 : step.status === "failed" ? XCircle : step.status === "running" ? Loader2 : Circle
          return (
            <div key={step.title} className="flex gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{step.title}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 4: 实现 Strategy、Blueprint、Inspector 面板

**Files:**
- Create: `src/components/workspace/StrategyPanel.tsx`
- Create: `src/components/workspace/BlueprintPanel.tsx`
- Create: `src/components/workspace/BuildInspector.tsx`

- [ ] **Step 1: 写 StrategyPanel**

```tsx
export function StrategyPanel({ strategy }: { strategy: unknown }) {
  if (!strategy) {
    return <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">等待 Strategy Agent 输出。</div>
  }

  return (
    <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-4 text-xs">
      {JSON.stringify(strategy, null, 2)}
    </pre>
  )
}
```

- [ ] **Step 2: 写 BlueprintPanel**

```tsx
export function BlueprintPanel({ blueprint }: { blueprint: unknown }) {
  if (!blueprint) {
    return <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">等待 Product Blueprint。</div>
  }

  return (
    <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-4 text-xs">
      {JSON.stringify(blueprint, null, 2)}
    </pre>
  )
}
```

- [ ] **Step 3: 写 BuildInspector**

```tsx
export function BuildInspector({ versions }: { versions: Array<{ id: string; version: number; changeSummary: string }> }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Build Inspector</h2>
      {versions.map((version) => (
        <div key={version.id} className="rounded-md border border-border p-3 text-sm">
          <div className="font-medium">Version {version.version}</div>
          <p className="mt-1 text-muted-foreground">{version.changeSummary}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 5: 提交 Workspace UI

- [ ] **Step 1: 运行构建**

Run: `npm run build`

Expected: Next.js build succeeds。

- [ ] **Step 2: 提交**

```bash
git add src/app src/components
git commit -m "feat: add ventureflow workspace ui"
```


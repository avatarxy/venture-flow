# Chat UI & Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现对话式 AI Builder 界面——左侧 Chat Panel（对话面板）+ 右侧 Preview Panel（应用预览），支持流式消息、富交互卡片和 Sandpack 实时预览。

**Architecture:** 对话状态管理使用 Vercel AI SDK 的 `useChat` hook（接管消息列表、流式 SSE 接收、加载态、`append`/`stop` 控制）。Chat Panel + Preview Panel 双栏布局，Preview 独立渲染 Sandpack。在 `useChat` 基础上扩展 `Message` 类型以支持 VentureFlow 的 8 种消息类型（`agent-strategy`、`agent-blueprint` 等），再通过类型路由到对应的富交互卡片组件。

**Tech Stack:** Next.js App Router、React、Tailwind CSS、shadcn/ui、lucide-react、Sandpack、Vercel AI SDK（`useChat` hook）、SSE。

---

## 文件结构

```text
src/app/page.tsx                                              # 首页（Hero + 创建项目入口）
src/app/projects/[projectId]/page.tsx                         # 项目对话页（Chat + Preview 双栏）
src/components/chat/ChatPanel.tsx                             # 对话面板容器
src/components/chat/ChatMessage.tsx                           # 单条消息渲染（路由到具体卡片）
src/components/chat/ChatInput.tsx                             # 消息输入框
src/components/chat/AgentProgressBar.tsx                      # Agent 步骤进度条
src/components/chat/cards/MessageCard.tsx                     # 富交互消息卡片容器（通用壳）
src/components/chat/cards/StrategyCard.tsx                    # Strategy 分析结果卡片
src/components/chat/cards/BlueprintCard.tsx                   # Product Blueprint 卡片（可展开详情）
src/components/chat/cards/BuildResultCard.tsx                 # Builder 完成卡片
src/components/chat/cards/ReviewResultCard.tsx                # 审查结果卡片
src/components/chat/cards/ErrorCard.tsx                       # 错误/警告卡片
src/components/chat/cards/ThinkingIndicator.tsx               # Agent 思考中的加载动画
src/components/chat/InlineActions.tsx                         # 内联操作按钮组
src/components/generated-preview/SandpackRunner.tsx           # Sandpack Provider + Preview
src/components/generated-preview/PublicPreviewShell.tsx        # 公开 Preview 壳
src/components/projects/CreateProjectForm.tsx                 # 首页创建项目表单
```

## Task 1: 实现首页项目创建入口

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/projects/CreateProjectForm.tsx`
- Create: `src/app/api/projects/route.ts`

- [ ] **Step 1: 写创建项目 API**（保持不变，直接复用现有实现）

```ts
import { NextResponse } from "next/server"
import { createProject } from "@/server/projects/project-repository"

export async function POST(request: Request) {
  const body = await request.json()
  const project = await createProject(String(body.originalProblem ?? ""))
  return NextResponse.json({ project })
}
```

- [ ] **Step 2: 写首页对话式创建表单**

```tsx
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Send } from "lucide-react"

export function CreateProjectForm() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (message.length < 10) return
    setIsSubmitting(true)

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalProblem: message }),
    })
    const payload = await response.json()
    router.push(`/projects/${payload.project.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="描述你想解决的业务问题..."
        className="min-h-[72px] flex-1 resize-none bg-transparent px-3 py-2 text-[16px] leading-relaxed placeholder:text-muted focus:outline-none"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (message.length >= 10) handleSubmit(e)
          }
        }}
      />
      <button
        type="submit"
        disabled={isSubmitting || message.length < 10}
        className="mt-auto shrink-0 rounded-xl bg-[#C88D2B] p-3 text-[#fcfbf8] disabled:opacity-40"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  )
}
```

- [ ] **Step 3: 接入首页 Hero**

```tsx
import { CreateProjectForm } from "@/components/projects/CreateProjectForm"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[720px] flex-col justify-center gap-10 px-6 py-10">
      <section className="space-y-4 text-center">
        <h1 className="text-[60px] font-semibold leading-[1.05] tracking-[-1.5px] text-[#1c1c1c]" style={{ fontFamily: "'Camera Plain Variable', ui-sans-serif, system-ui" }}>
          VentureFlow
        </h1>
        <p className="max-w-md mx-auto text-lg leading-relaxed text-[#5f5f5d]">
          描述你的业务问题，AI 将自动分析、设计并生成可直接使用的业务应用。
        </p>
      </section>
      <CreateProjectForm />
      <p className="text-center text-sm text-[#5f5f5d]">
        试试："销售团队在用 Excel 管理客户，经常漏跟线索"
      </p>
    </main>
  )
}
```

- [ ] **Step 4: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 2: 实现 Chat + Preview 双栏布局

**Files:**
- Create: `src/app/projects/[projectId]/page.tsx`
- Create: `src/components/chat/ChatPanel.tsx`

- [ ] **Step 1: 写项目对话页双栏布局**

使用 `useChat` hook 接管消息状态，页面只需管理 Preview 文件状态和从消息 metadata 中提取 build 数据：

```tsx
"use client"

import { useState, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { useParams } from "next/navigation"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { SandpackRunner } from "@/components/generated-preview/SandpackRunner"
import type { GeneratedFile } from "@/server/contracts"

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>()
  const [previewFiles, setPreviewFiles] = useState<GeneratedFile[]>([])

  // useChat 接管所有消息状态（列表、流式接收、加载态）
  const { messages, input, handleInputChange, handleSubmit, append, isLoading, stop } = useChat({
    api: `/api/projects/${params.projectId}/agent/messages`,
    body: { projectId: params.projectId },
    // Agent 产出 build 时，同步更新 Preview
    onFinish(message) {
      const metadata = (message as VentureFlowMessage).metadata
      if (metadata?.build?.files) {
        setPreviewFiles(metadata.build.files)
      }
    },
  })

  return (
    <main className="grid h-[calc(100vh-57px)] grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)]">
      <ChatPanel
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        append={append}
        isLoading={isLoading}
        stop={stop}
      />
      <section className="hidden border-l border-[#eceae4] bg-[#f7f4ed] lg:block">
        {previewFiles.length > 0 ? (
          <SandpackRunner files={previewFiles} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#5f5f5d]">
            Agent 生成应用后将在此处实时预览
          </div>
        )}
      </section>
    </main>
  )
}

// 扩展 Vercel AI SDK 的 Message 类型
interface VentureFlowMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  type?: string          // 消息类型：agent-strategy / agent-blueprint / ...
  metadata?: Record<string, unknown>
  createdAt?: string
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 3: 实现 ChatPanel 核心组件（基于 useChat）

**Files:**
- Create: `src/components/chat/ChatPanel.tsx`
- Create: `src/components/chat/ChatMessage.tsx`
- Create: `src/components/chat/AgentProgressBar.tsx`

**Architecture:** ChatPanel 不再自己管理消息状态、fetch 和 SSE 流——这些全部由 `useChat` hook 接管（在 Task 2 的页面层调用）。ChatPanel 只负责渲染：消息列表 + 进度条 + 输入框。输入框绑定到 `handleInputChange`/`handleSubmit`，内联按钮使用 `append` 发送预设消息。

- [ ] **Step 1: 写 ChatPanel 容器**

```tsx
"use client"

import type { Message } from "ai"
import { useRef, useEffect } from "react"
import { ChatMessage as ChatMessageComponent } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { AgentProgressBar } from "./AgentProgressBar"

interface VentureFlowMessage extends Message {
  type?: string
  metadata?: Record<string, unknown>
}

interface ChatPanelProps {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  append: (message: { role: "user"; content: string }) => void
  isLoading: boolean
  stop: () => void
}

export function ChatPanel({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  append,
  isLoading,
  stop,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // useChat 自动处理消息列表更新后滚动
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  // 从最后一条 agent 消息推断 AgentState 进度
  const lastAgentMsg = [...messages].reverse().find(m => m.role === "assistant") as VentureFlowMessage | undefined
  const metadata = lastAgentMsg?.metadata
  const agentProgress = metadata?.agentState as { currentStep: number; currentPlan?: Array<{ title: string }> } | undefined

  return (
    <div className="flex h-full flex-col border-r border-[#eceae4] bg-[#f7f4ed]">
      <AgentProgressBar
        currentStep={agentProgress?.currentStep ?? 0}
        totalSteps={agentProgress?.currentPlan?.length ?? 6}
        isRunning={isLoading}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-[#5f5f5d]">
            <p className="max-w-[280px] text-center leading-relaxed">
              描述你的业务问题，AI 将自动分析、设计并生成应用。
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg as VentureFlowMessage} />
        ))}
      </div>

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
      />
    </div>
  )
}
```

- [ ] **Step 2: 写 ChatInput（绑定 useChat）**

```tsx
"use client"

import { Send, Square } from "lucide-react"
import { useRef, useEffect } from "react"

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  stop: () => void
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading, stop }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus()
  }, [isLoading])

  return (
    <div className="border-t border-[#eceae4] p-3">
      <form onSubmit={handleSubmit}>
        <div className="flex items-end gap-2 rounded-xl border border-[#eceae4] bg-[#f7f4ed] p-2 focus-within:shadow-[rgba(0,0,0,0.1)_0px_4px_12px] focus-within:border-[rgba(28,28,28,0.4)]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            placeholder={isLoading ? "Agent 正在执行..." : "输入消息..."}
            className="min-h-[40px] max-h-[120px] flex-1 resize-none bg-transparent px-2 py-1 text-[15px] leading-relaxed placeholder:text-[#5f5f5d] focus:outline-none"
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                if (input.trim()) handleSubmit(e)
              }
            }}
          />
          {isLoading ? (
            <button type="button" onClick={stop} className="shrink-0 rounded-lg p-2 text-[#C23B3B] hover:bg-[rgba(194,59,59,0.06)]">
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()} className="shrink-0 rounded-lg p-2 text-[#C88D2B] hover:bg-[rgba(200,141,43,0.06)] disabled:opacity-30">
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: 写消息路由组件**（基于 Vercel AI SDK Message 类型扩展）

```tsx
import type { Message } from "ai"
import { StrategyCard } from "./cards/StrategyCard"
import { BlueprintCard } from "./cards/BlueprintCard"
import { BuildResultCard } from "./cards/BuildResultCard"
import { ReviewResultCard } from "./cards/ReviewResultCard"
import { ErrorCard } from "./cards/ErrorCard"
import { ThinkingIndicator } from "./cards/ThinkingIndicator"

interface VentureFlowMessage extends Message {
  type?: string
  metadata?: Record<string, unknown>
}

export function ChatMessage({ message }: { message: VentureFlowMessage }) {
  // 用户消息 → 右对齐深色气泡
  if (message.role === "user") {
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[#1c1c1c] px-4 py-2.5 text-[15px] leading-relaxed text-[#fcfbf8]">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4">
      {renderAgentMessage(message)}
    </div>
  )
}

function renderAgentMessage(message: VentureFlowMessage) {
  switch (message.type) {
    case "agent-strategy":
      return <StrategyCard content={message.content} metadata={message.metadata} />
    case "agent-blueprint":
      return <BlueprintCard content={message.content} metadata={message.metadata} />
    case "agent-build":
      return <BuildResultCard content={message.content} metadata={message.metadata} />
    case "agent-review":
      return <ReviewResultCard content={message.content} metadata={message.metadata} />
    case "agent-error":
      return <ErrorCard content={message.content} metadata={message.metadata} />
    case "agent-question":
      return <ErrorCard content={message.content} metadata={message.metadata} />
    case "agent-thinking":
      return <ThinkingIndicator content={message.content} />
    default:
      return (
        <div className="rounded-xl border border-[#eceae4] bg-[#f7f4ed] p-3 text-sm leading-relaxed text-[#1c1c1c]">
          {message.content}
        </div>
      )
  }
}
}
```

- [ ] **Step 4: 写 AgentProgressBar**

```tsx
export function AgentProgressBar({ currentStep, totalSteps, isRunning }: {
  currentStep: number
  totalSteps: number
  isRunning: boolean
}) {
  const percentage = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0

  return (
    <div className="border-b border-[#eceae4] p-3">
      <div className="flex items-center justify-between text-xs text-[#5f5f5d]">
        <span>{isRunning ? `正在执行第 ${currentStep}/${totalSteps} 步` : "就绪"}</span>
        <span>{percentage}%</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#eceae4]">
        <div
          className="h-full rounded-full bg-[#C88D2B] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 4: 实现富交互消息卡片

**Files:**
- Create: `src/components/chat/cards/MessageCard.tsx`
- Create: `src/components/chat/cards/StrategyCard.tsx`
- Create: `src/components/chat/cards/BlueprintCard.tsx`
- Create: `src/components/chat/cards/BuildResultCard.tsx`
- Create: `src/components/chat/cards/ReviewResultCard.tsx`
- Create: `src/components/chat/cards/ErrorCard.tsx`
- Create: `src/components/chat/cards/ThinkingIndicator.tsx`
- Create: `src/components/chat/InlineActions.tsx`

- [ ] **Step 1: 写 MessageCard 容器**

```tsx
import type { ReactNode } from "react"
import { InlineActions } from "../InlineActions"

interface MessageCardProps {
  icon: ReactNode
  title: string
  children: ReactNode
  actions?: Array<{ label: string; onClick: () => void; variant?: "primary" | "ghost" }>
}

export function MessageCard({ icon, title, children, actions }: MessageCardProps) {
  return (
    <div className="rounded-xl border border-[#eceae4] bg-[#f7f4ed]">
      {/* 头部 */}
      <div className="flex items-center gap-2 border-b border-[#eceae4] px-4 py-3">
        <span className="text-[#C88D2B]">{icon}</span>
        <span className="text-sm font-semibold text-[#1c1c1c]">{title}</span>
      </div>

      {/* 内容 */}
      <div className="px-4 py-3">
        {children}
      </div>

      {/* 操作按钮 */}
      {actions && actions.length > 0 && (
        <div className="border-t border-[#eceae4] px-4 py-2">
          <InlineActions actions={actions} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 写 StrategyCard**

```tsx
import { Lightbulb } from "lucide-react"
import { MessageCard } from "./MessageCard"

export function StrategyCard({ content, metadata }: { content: string; metadata: unknown }) {
  const strategy = metadata as Record<string, unknown> | undefined

  return (
    <MessageCard
      icon={<Lightbulb className="h-4 w-4" />}
      title="业务分析"
      actions={[
        { label: "不满意，重新分析", onClick: () => {}, variant: "ghost" },
        { label: "继续生成 Blueprint", onClick: () => {}, variant: "primary" },
      ]}
    >
      <div className="space-y-2 text-sm leading-relaxed text-[#1c1c1c]">
        <p>{content}</p>
        {strategy && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-[#5f5f5d]">查看完整分析</summary>
            <pre className="mt-2 overflow-auto rounded-md bg-[rgba(28,28,28,0.03)] p-2 text-xs">
              {JSON.stringify(strategy, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </MessageCard>
  )
}
```

- [ ] **Step 3: 写 BlueprintCard**

```tsx
import { ClipboardList } from "lucide-react"
import { MessageCard } from "./MessageCard"
import type { ProductBlueprint } from "@/server/contracts"

export function BlueprintCard({ metadata }: { content: string; metadata: unknown }) {
  const blueprint = metadata as ProductBlueprint | undefined

  return (
    <MessageCard
      icon={<ClipboardList className="h-4 w-4" />}
      title="Product Blueprint"
      actions={[
        { label: "修改", onClick: () => {}, variant: "ghost" },
        { label: "继续生成应用", onClick: () => {}, variant: "primary" },
      ]}
    >
      {blueprint && (
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-xs font-medium text-[#5f5f5d]">应用类型</span>
            <p className="mt-0.5 text-[#1c1c1c]">{blueprint.appPattern}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-[#5f5f5d]">实体（{blueprint.entities.length}/4）</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {blueprint.entities.map((entity) => (
                <span key={entity.name} className="rounded-full bg-[rgba(200,141,43,0.12)] px-2.5 py-0.5 text-xs text-[#C88D2B]">
                  {entity.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-[#5f5f5d]">页面（{blueprint.pages.length}/5）</span>
            <ul className="mt-1 list-inside list-disc text-[#1c1c1c]">
              {blueprint.pages.map((page) => (
                <li key={page.id} className="text-sm">{page.name} — {page.purpose}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </MessageCard>
  )
}
```

- [ ] **Step 4: 写 BuildResultCard**

```tsx
import { Play } from "lucide-react"
import { MessageCard } from "./MessageCard"

export function BuildResultCard({ content, metadata }: { content: string; metadata: unknown }) {
  return (
    <MessageCard
      icon={<Play className="h-4 w-4" />}
      title="应用生成完成"
      actions={[
        { label: "不满意，重新生成", onClick: () => {}, variant: "ghost" },
        { label: "可以，就这样", onClick: () => {}, variant: "primary" },
      ]}
    >
      <div className="text-sm leading-relaxed text-[#1c1c1c]">
        <p>{content}</p>
        <p className="mt-2 text-xs text-[#5f5f5d]">请在右侧面板查看和试用生成的应用。</p>
      </div>
    </MessageCard>
  )
}
```

- [ ] **Step 5: 写 InlineActions**

```tsx
interface ActionItem {
  label: string
  onClick: () => void
  variant?: "primary" | "ghost"
}

export function InlineActions({ actions }: { actions: ActionItem[] }) {
  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={
            action.variant === "primary"
              ? "rounded-lg bg-[#C88D2B] px-3 py-1.5 text-xs font-medium text-[#fcfbf8] hover:bg-[#A87422]"
              : "rounded-lg border border-[rgba(28,28,28,0.4)] px-3 py-1.5 text-xs text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)]"
          }
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 5: 内联操作连接 Agent（基于 useChat append）

- [ ] **Step 1: 卡片按钮通过 `append` 发送预设消息**

`useChat` 的 `append` 方法可以直接向聊天流追加用户消息并触发 API 调用。卡片中的内联操作按钮无需自己封装 sendMessage，直接使用 `append`：

```tsx
// 页面层将 append 传给 ChatPanel，ChatPanel 再传给各卡片组件
// StrategyCard 示例
import type { Message } from "ai"

interface StrategyCardProps {
  content: string
  metadata?: Record<string, unknown>
  append: (message: { role: "user"; content: string }) => void
}

export function StrategyCard({ content, metadata, append }: StrategyCardProps) {
  return (
    <MessageCard
      icon={<Lightbulb className="h-4 w-4" />}
      title="业务分析"
      actions={[
        { label: "不满意，重新分析", onClick: () => append({ role: "user", content: "重新分析业务问题" }), variant: "ghost" },
        { label: "继续生成 Blueprint", onClick: () => append({ role: "user", content: "继续" }), variant: "primary" },
      ]}
    >
      ...
    </MessageCard>
  )
}
```

核心原理：内联按钮本质上就是模拟用户发送预设的对话消息，`useChat.append()` 完成三件事：
1. 追加用户消息到 messages 列表
2. 调用 API endpoint
3. 流式接收 Agent 响应

- [ ] **Step 2: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 6: 提交 Chat UI

- [ ] **Step 1: 运行构建**

Run: `npm run build`

Expected: Next.js build succeeds。

- [ ] **Step 2: 提交**

```bash
git add src/app src/components/chat src/components/generated-preview
git commit -m "feat: add conversational chat ui with preview panel"
```

---

## 设计原则

### 视觉层级

- **Agent 消息卡片**：白色卡片（`#f7f4ed`），`1px solid #eceae4` 边框，金色顶部图标
- **用户消息气泡**：深色气泡（`#1c1c1c`），白色文字（`#fcfbf8`），右对齐
- **系统消息**：灰色细条，居中，不影响阅读流
- **内联操作按钮**：金色主操作（继续/确认），透明次要操作（修改/重做）

### 响应式行为

| 断点 | 布局 | Chat 宽 | Preview |
|------|------|---------|---------|
| ≥1024px | 双栏并排 | 420px | flex |
| 768-1023px | 双栏并排 | 360px | flex |
| <768px | 单栏切换 | 全宽 | 全宽（Tab 切换） |

移动端：Chat 和 Preview 不并排显示，顶部提供 Tab 切换。默认显示 Chat，用户可在生成应用后切到 Preview 查看。

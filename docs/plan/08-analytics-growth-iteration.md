# Analytics Growth Iteration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Usage Analytics、Growth Agent 优化建议和 Apply Improvement 新版本生成。

**Architecture:** Analytics 从 UsageEvent 聚合数据，Growth Agent 作为 Mastra tool 暴露给 Supervisor，并通过 Vercel AI SDK 基于真实事件和 Blueprint 输出建议。Apply Improvement 将建议转换成 Patch Request，调用 Builder/Repair 生成新版本。

**Tech Stack:** Prisma、TypeScript、Mastra、Vercel AI SDK、Zod、Recharts、Vitest。

---

## 文件结构

```text
src/server/analytics/analytics-service.ts
src/server/analytics/analytics-service.test.ts
src/server/tools/optimize-product.ts
src/server/tools/apply-improvement.ts
src/components/workspace/AnalyticsPanel.tsx
src/app/api/projects/[projectId]/analytics/route.ts
src/app/api/projects/[projectId]/optimize/route.ts
src/app/api/projects/[projectId]/apply-improvement/route.ts
```

## Task 1: 实现 Analytics 聚合服务

**Files:**
- Create: `src/server/analytics/analytics-service.ts`
- Create: `src/server/analytics/analytics-service.test.ts`

- [ ] **Step 1: 写测试**

```ts
import { describe, expect, it } from "vitest"
import { aggregateUsageEvents } from "./analytics-service"

describe("aggregateUsageEvents", () => {
  it("counts key events", () => {
    const summary = aggregateUsageEvents([
      { eventName: "app_opened" },
      { eventName: "entity_created" },
      { eventName: "entity_created" },
      { eventName: "search_used" },
    ])

    expect(summary.totalVisits).toBe(1)
    expect(summary.createdRecords).toBe(2)
    expect(summary.searchAndFilterUses).toBe(1)
  })
})
```

- [ ] **Step 2: 实现聚合**

```ts
export type UsageEventLike = {
  eventName: string
}

export function aggregateUsageEvents(events: UsageEventLike[]) {
  return {
    totalVisits: events.filter((event) => event.eventName === "app_opened").length,
    activeActions: events.filter((event) => event.eventName !== "app_opened").length,
    createdRecords: events.filter((event) => event.eventName === "entity_created").length,
    statusChanges: events.filter((event) => event.eventName === "status_changed").length,
    searchAndFilterUses: events.filter((event) => event.eventName === "search_used" || event.eventName === "filter_used").length,
  }
}
```

- [ ] **Step 3: 运行测试**

Run: `npm run test -- src/server/analytics/analytics-service.test.ts`

Expected: 1 test passes。

## Task 2: 添加 Analytics API

**Files:**
- Create: `src/app/api/projects/[projectId]/analytics/route.ts`

- [ ] **Step 1: 写 API**

```ts
import { NextResponse } from "next/server"
import { aggregateUsageEvents } from "@/server/analytics/analytics-service"
import { prisma } from "@/server/db/client"

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const events = await prisma.usageEvent.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  return NextResponse.json({
    summary: aggregateUsageEvents(events),
    events,
  })
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 3: 实现 AnalyticsPanel

**Files:**
- Create: `src/components/workspace/AnalyticsPanel.tsx`

- [ ] **Step 1: 写面板组件**

```tsx
type AnalyticsSummary = {
  totalVisits: number
  activeActions: number
  createdRecords: number
  statusChanges: number
  searchAndFilterUses: number
}

export function AnalyticsPanel({ summary }: { summary: AnalyticsSummary }) {
  const metrics = [
    ["总访问量", summary.totalVisits],
    ["活跃操作数", summary.activeActions],
    ["新增记录数", summary.createdRecords],
    ["状态变更次数", summary.statusChanges],
    ["搜索和筛选次数", summary.searchAndFilterUses],
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map(([label, value]) => (
        <div key={label} className="rounded-md border border-border p-4">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 4: 实现 Growth Agent 工具

**Files:**
- Create: `src/server/tools/optimize-product.ts`
- Create: `src/app/api/projects/[projectId]/optimize/route.ts`

- [ ] **Step 1: 写 Vercel AI SDK 输出解析与 Mastra tool**

```ts
import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { optimizationOutputSchema } from "@/server/contracts"
import { generateStructuredObject } from "@/server/ai/generate-structured"

const optimizeProductInputSchema = z.object({
  projectId: z.string(),
  blueprint: z.record(z.unknown()),
  usageEvents: z.array(z.record(z.unknown())).min(1),
})

export async function optimizeProduct(input: z.infer<typeof optimizeProductInputSchema>) {
  return generateStructuredObject({
    schema: optimizationOutputSchema,
    system: `你是 VentureFlow 的 Growth Agent。
你必须只基于输入中的真实 Usage Events、Product Blueprint 和 Success Metrics 给出建议。
如果证据不足，必须明确说明数据不足。
不要把推断描述为事实。`,
    prompt: JSON.stringify(input, null, 2),
  })
}

export const optimizeProductTool = createTool({
  id: "optimize_product",
  description: "根据 Product Blueprint、当前版本和真实 Usage Events 生成产品优化建议。",
  inputSchema: optimizeProductInputSchema,
  outputSchema: optimizationOutputSchema,
  execute: async (inputData) => optimizeProduct(inputData),
})
```

- [ ] **Step 2: 写 API 骨架**

```ts
import { NextResponse } from "next/server"
import { prisma } from "@/server/db/client"

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const events = await prisma.usageEvent.findMany({ where: { projectId }, take: 100 })

  if (events.length === 0) {
    return NextResponse.json({
      findings: [],
      recommendations: [],
      message: "当前真实使用数据不足，无法生成可靠优化建议。",
    })
  }

  return NextResponse.json({ status: "accepted" })
}
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 5: 实现 Apply Improvement

**Files:**
- Create: `src/server/tools/apply-improvement.ts`
- Create: `src/app/api/projects/[projectId]/apply-improvement/route.ts`

- [ ] **Step 1: 写 Patch Request 类型**

```ts
import { z } from "zod"

export const patchRequestSchema = z.object({
  goal: z.string().min(1),
  recommendation: z.string().min(1),
  targetFiles: z.array(z.string().startsWith("/")).min(1),
  constraints: z.array(z.string()).min(1),
})

export type PatchRequest = z.infer<typeof patchRequestSchema>
```

- [ ] **Step 2: 写 API 骨架**

```ts
import { NextResponse } from "next/server"
import { patchRequestSchema } from "@/server/tools/apply-improvement"

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const body = await request.json()
  const patchRequest = patchRequestSchema.parse(body)

  return NextResponse.json({
    projectId,
    patchRequest,
    status: "accepted",
  })
}
```

- [ ] **Step 3: 运行验证**

Run: `npm run typecheck && npm run test -- src/server/analytics`

Expected: typecheck 通过，analytics 测试通过。

- [ ] **Step 4: 提交**

```bash
git add src/server/analytics src/server/tools/optimize-product.ts src/server/tools/apply-improvement.ts src/components/workspace/AnalyticsPanel.tsx src/app/api/projects
git commit -m "feat: add analytics and growth iteration"
```

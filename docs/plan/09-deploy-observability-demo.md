# Deploy Observability Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成部署配置、系统日志、Demo 数据、验收脚本和 README，使 MVP 可以稳定演示。

**Architecture:** Vercel 承载 Next.js 应用，Supabase 提供 PostgreSQL。系统日志先写标准输出和关键数据库状态，Demo 验收用固定输入跑通主链路。

**Tech Stack:** Vercel、Supabase、Next.js、Mastra、Vercel AI SDK、Prisma、Playwright、Markdown。

---

## 文件结构

```text
README.md
docs/demo-script.md
docs/acceptance-checklist.md
src/server/observability/system-log.ts
src/server/demo/demo-inputs.ts
tests/e2e/demo-flow.spec.ts
vercel.json
```

## Task 1: 添加系统日志封装

**Files:**
- Create: `src/server/observability/system-log.ts`

- [ ] **Step 1: 写日志函数**

```ts
type SystemLogLevel = "info" | "warn" | "error"

export function writeSystemLog(input: {
  level: SystemLogLevel
  eventName: string
  projectId?: string
  generationId?: string
  message: string
  metadata?: Record<string, unknown>
}) {
  const payload = {
    ...input,
    createdAt: new Date().toISOString(),
  }

  console[input.level](JSON.stringify(payload))
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 2: 添加 Demo 输入

**Files:**
- Create: `src/server/demo/demo-inputs.ts`
- Create: `docs/demo-script.md`

- [ ] **Step 1: 写 Demo 输入**

```ts
export const demoInputs = [
  {
    title: "销售管理",
    problem: "我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。",
    expectedPattern: "crm",
  },
  {
    title: "客户反馈",
    problem: "客户反馈分散在邮件、群聊和客服系统中，我们无法判断哪些需求最重要，也无法让客户知道需求处理进度。",
    expectedPattern: "feedback-board",
  },
  {
    title: "内容运营",
    problem: "内容团队有大量选题，但缺少统一的排期、负责人和发布状态管理，导致内容经常延期。",
    expectedPattern: "content-planner",
  },
]
```

- [ ] **Step 2: 写演示脚本**

```markdown
# VentureFlow MVP Demo Script

## 主线案例：销售管理

1. 打开首页。
2. 输入：我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。
3. 创建项目。
4. 展示 Agent Timeline 动态推进。
5. 展示 Strategy 中的 Facts、Assumptions、Success Metrics。
6. 展示 Blueprint 中的页面、实体、产品决策。
7. 展示 Preview 中可操作的 CRM 应用。
8. 新增一条销售线索。
9. 修改线索状态。
10. 打开 Analytics，展示 Usage Events 聚合指标。
11. 运行 Growth Agent，展示基于数据的优化建议。
12. 点击 Apply Improvement，展示 Version 2。
```

- [ ] **Step 3: 提交**

```bash
git add src/server/demo docs/demo-script.md
git commit -m "docs: add demo script and inputs"
```

## Task 3: 添加验收清单

**Files:**
- Create: `docs/acceptance-checklist.md`

- [ ] **Step 1: 写验收清单**

```markdown
# VentureFlow MVP Acceptance Checklist

## P0 链路

- [ ] 首页可以输入至少 20 个字符的业务问题。
- [ ] 创建项目后可以进入 Workspace。
- [ ] Agent Timeline 可以展示运行状态。
- [ ] Strategy 输出包含 Facts、Assumptions、Validation Questions 和 Success Metrics。
- [ ] Blueprint 通过 Zod 校验。
- [ ] Build 输出包含 /App.tsx。
- [ ] Preview 可以运行生成应用。
- [ ] 生成应用至少支持新增操作。
- [ ] 生成应用至少支持修改或状态变更操作。
- [ ] 生成应用支持搜索、筛选或排序中的至少一种。
- [ ] 生成应用使用 localStorage 持久化。
- [ ] 公开 Preview 可以匿名访问。
- [ ] 公开 Preview 操作可以写入 Usage Events。
- [ ] Analytics 至少展示 3 个统计指标。
- [ ] Growth Agent 的建议引用真实事件数据或明确提示数据不足。
- [ ] Apply Improvement 生成新版本，旧版本保留。
```

- [ ] **Step 2: 提交**

```bash
git add docs/acceptance-checklist.md
git commit -m "docs: add acceptance checklist"
```

## Task 4: 添加 E2E 验收测试

**Files:**
- Create: `tests/e2e/demo-flow.spec.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: 写 E2E 测试**

```ts
import { expect, test } from "@playwright/test"

test("demo flow starts from a business problem", async ({ page }) => {
  await page.goto("/")
  await page.getByPlaceholder("你正在尝试解决什么业务问题？").fill("我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。")
  await page.getByRole("button", { name: "创建项目" }).click()
  await expect(page).toHaveURL(/\/projects\//)
})
```

- [ ] **Step 2: 运行 E2E**

Run: `npm run test:e2e -- tests/e2e/demo-flow.spec.ts`

Expected: 1 test passes。

## Task 5: 添加 Vercel 配置和 README

**Files:**
- Create: `vercel.json`
- Create: `README.md`

- [ ] **Step 1: 写 Vercel 配置**

```json
{
  "framework": "nextjs",
  "regions": ["hkg1"]
}
```

- [ ] **Step 2: 写 README**

```markdown
# VentureFlow

VentureFlow 是一个 Problem-first AI solution builder。用户描述业务问题，系统通过有边界的自治 Agent 生成 Strategy、Product Blueprint、可运行应用、Usage Analytics 和改进版本。

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vercel AI SDK
- Mastra
- Zod
- Prisma
- Supabase PostgreSQL
- Sandpack

## Local Development

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## Verification

```bash
npm run typecheck
npm run test
npm run build
npm run test:e2e
```
```

- [ ] **Step 3: 运行最终验证**

Run: `npm run typecheck && npm run test && npm run build`

Expected: 全部命令 exit code 为 `0`。

- [ ] **Step 4: 提交**

```bash
git add README.md vercel.json tests/e2e docs src/server/observability
git commit -m "chore: add deployment and demo readiness"
```

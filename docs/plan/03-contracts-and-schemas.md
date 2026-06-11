# Contracts And Schemas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 定义 Strategy、Blueprint、Build、Review、AgentAction、Optimization 的统一 TypeScript 类型和 Zod Schema。

**Architecture:** 所有 AI 输出先通过 Zod 校验，再进入数据库和 UI。类型从 Schema 推导，减少前后端字段漂移。

**Tech Stack:** TypeScript、Zod、Vitest。

---

## 文件结构

```text
src/server/contracts/strategy.ts
src/server/contracts/blueprint.ts
src/server/contracts/build.ts
src/server/contracts/review.ts
src/server/contracts/agent.ts
src/server/contracts/json.ts
src/server/contracts/optimization.ts
src/server/contracts/index.ts
src/server/contracts/contracts.test.ts
```

## Task 1: 定义 Strategy Schema

**Files:**
- Create: `src/server/contracts/strategy.ts`

- [x] **Step 1: 写 Strategy Schema**

```ts
import { z } from "zod"

export const appPatternSchema = z.enum([
  "dashboard",
  "crm",
  "feedback-board",
  "task-manager",
  "content-planner",
  "booking-manager",
  "survey",
  "custom-crud",
])

export const strategyOutputSchema = z.object({
  problemSummary: z.string().min(10),
  targetUsers: z.array(z.string().min(1)).min(1),
  painPoints: z.array(z.string().min(1)).min(1),
  desiredOutcomes: z.array(z.string().min(1)).min(1),
  successMetrics: z.array(z.string().min(1)).min(1),
  facts: z.array(z.string()),
  assumptions: z.array(z.string()),
  validationQuestions: z.array(z.string()),
  recommendedAppPattern: appPatternSchema,
})

export type StrategyOutput = z.infer<typeof strategyOutputSchema>
```

- [x] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 2: 定义 Product Blueprint Schema

**Files:**
- Create: `src/server/contracts/blueprint.ts`

- [x] **Step 1: 写 Blueprint Schema**

```ts
import { z } from "zod"
import { jsonValueSchema } from "./json"
import { appPatternSchema } from "./strategy"

export const fieldSchema = z.object({
  name: z.string().regex(/^[a-z][a-zA-Z0-9]*$/),
  label: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "date", "status", "select", "text"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
})

export const entitySchema = z.object({
  name: z.string().regex(/^[A-Z][a-zA-Z0-9]*$/),
  label: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(fieldSchema).min(2).max(12),
})

export const componentSchema = z.object({
  type: z.enum(["table", "form", "dashboard", "kanban", "calendar", "detail", "chart"]),
  title: z.string().min(1),
  entityName: z.string().optional(),
})

export const pageSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  route: z.string().startsWith("/"),
  purpose: z.string().min(10),
  components: z.array(componentSchema).min(1).max(5),
})

export const workflowSchema = z.object({
  title: z.string().min(1),
  steps: z.array(z.string().min(1)).min(2),
})

export const productDecisionSchema = z.object({
  title: z.string().min(1),
  decision: z.string().min(1),
  reason: z.string().min(1),
  tradeoff: z.string().min(1),
})

export const productBlueprintSchema = z.object({
  productName: z.string().min(2),
  description: z.string().min(20),
  problemSummary: z.string().min(10),
  targetUsers: z.array(z.string().min(1)).min(1),
  goals: z.array(z.string().min(1)).min(1),
  successMetrics: z.array(z.string().min(1)).min(1),
  appPattern: appPatternSchema,
  entities: z.array(entitySchema).min(1).max(4),
  pages: z.array(pageSchema).min(2).max(5),
  workflows: z.array(workflowSchema).min(1).max(5),
  decisions: z.array(productDecisionSchema).min(1).max(8),
  seedData: z.record(z.string(), z.array(z.record(z.string(), jsonValueSchema))),
})

export type ProductBlueprint = z.infer<typeof productBlueprintSchema>
```

- [x] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 3: 定义 Build、Review、Agent 和 Optimization Schema

**Files:**
- Create: `src/server/contracts/build.ts`
- Create: `src/server/contracts/review.ts`
- Create: `src/server/contracts/agent.ts`
- Create: `src/server/contracts/json.ts`
- Create: `src/server/contracts/optimization.ts`
- Create: `src/server/contracts/index.ts`

- [x] **Step 1: 写 Build Schema**

```ts
import { z } from "zod"

export const generatedFileSchema = z.object({
  path: z.string().startsWith("/"),
  content: z.string().min(1),
})

export const buildOutputSchema = z.object({
  summary: z.string().min(1),
  files: z.array(generatedFileSchema).min(1),
})

export type GeneratedFile = z.infer<typeof generatedFileSchema>
export type BuildOutput = z.infer<typeof buildOutputSchema>
```

- [x] **Step 2: 写 Review Schema**

```ts
import { z } from "zod"

export const reviewIssueSchema = z.object({
  type: z.enum(["missing_file", "missing_feature", "forbidden_dependency", "compile_error", "empty_action", "persistence_missing"]),
  message: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
})

export const reviewResultSchema = z.object({
  passed: z.boolean(),
  issues: z.array(reviewIssueSchema),
  recommendedFix: z.string().optional(),
})

export type ReviewResult = z.infer<typeof reviewResultSchema>
```

- [x] **Step 3: 写 Agent Schema**

```ts
import { z } from "zod"
import { buildOutputSchema } from "./build"
import { productBlueprintSchema } from "./blueprint"
import { jsonObjectSchema } from "./json"
import { reviewResultSchema } from "./review"
import { strategyOutputSchema } from "./strategy"

export const toolNameSchema = z.enum([
  "analyze_problem",
  "inspect_capabilities",
  "create_blueprint",
  "validate_blueprint",
  "generate_application",
  "inspect_build",
  "run_preview",
  "repair_application",
  "save_project",
  "finish_task",
])

export const agentActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("tool"),
    reasoningSummary: z.string().min(1),
    toolName: toolNameSchema,
    arguments: jsonObjectSchema,
  }),
  z.object({
    type: z.literal("finish"),
    reasoningSummary: z.string().min(1),
  }),
])

export const toolCallRecordSchema = z.object({
  toolName: toolNameSchema,
  reasoningSummary: z.string(),
  argumentsSummary: z.string(),
  resultSummary: z.string().optional(),
  status: z.enum(["running", "completed", "failed"]),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  errorMessage: z.string().optional(),
  tokenUsage: z.number().int().nonnegative().default(0),
})

export const agentStateSchema = z.object({
  projectId: z.string(),
  originalProblem: z.string(),
  goal: z.string(),
  currentPlan: z.array(z.object({ title: z.string(), status: z.enum(["pending", "running", "completed", "failed"]) })),
  currentStep: z.number().int().nonnegative(),
  strategy: strategyOutputSchema.optional(),
  blueprint: productBlueprintSchema.optional(),
  build: buildOutputSchema.optional(),
  review: reviewResultSchema.optional(),
  toolCalls: z.array(toolCallRecordSchema),
  buildAttempts: z.number().int().nonnegative(),
  repairAttempts: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  status: z.enum(["planning", "executing", "waiting_for_user", "completed", "failed"]),
})

export type AgentAction = z.infer<typeof agentActionSchema>
export type AgentState = z.infer<typeof agentStateSchema>
```

- [x] **Step 4: 写 Optimization Schema**

```ts
import { z } from "zod"

export const optimizationRecommendationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]),
  evidence: z.array(z.string()).min(1),
  inference: z.string().min(1),
  expectedImpact: z.string().min(1),
  targetComponents: z.array(z.string()).min(1),
})

export const optimizationOutputSchema = z.object({
  findings: z.array(z.object({
    title: z.string().min(1),
    evidence: z.array(z.string()).min(1),
    inference: z.string().min(1),
  })),
  recommendations: z.array(optimizationRecommendationSchema).min(1),
})

export type OptimizationRecommendation = z.infer<typeof optimizationRecommendationSchema>
export type OptimizationOutput = z.infer<typeof optimizationOutputSchema>
```

- [x] **Step 5: 导出 contract**

```ts
export * from "./agent"
export * from "./blueprint"
export * from "./build"
export * from "./json"
export * from "./optimization"
export * from "./review"
export * from "./strategy"
```

## Task 4: 添加 Schema 测试

**Files:**
- Create: `src/server/contracts/contracts.test.ts`

- [x] **Step 1: 写测试**

```ts
import { describe, expect, it } from "vitest"
import { agentActionSchema, productBlueprintSchema, strategyOutputSchema } from "."

describe("contracts", () => {
  it("validates strategy output", () => {
    const result = strategyOutputSchema.safeParse({
      problemSummary: "销售线索分散，团队缺少统一跟进工具。",
      targetUsers: ["销售负责人"],
      painPoints: ["跟进容易遗漏"],
      desiredOutcomes: ["提高按时跟进率"],
      successMetrics: ["按时跟进率"],
      facts: ["当前使用 Excel 管理客户"],
      assumptions: ["每条线索存在明确阶段"],
      validationQuestions: ["是否需要邮件集成"],
      recommendedAppPattern: "crm",
    })

    expect(result.success).toBe(true)
  })

  it("rejects blueprint with too many pages", () => {
    const result = productBlueprintSchema.safeParse({
      productName: "销售管理",
      description: "用于管理销售线索和跟进状态的轻量 CRM。",
      problemSummary: "销售线索分散，团队缺少统一跟进工具。",
      targetUsers: ["销售负责人"],
      goals: ["减少遗漏"],
      successMetrics: ["按时跟进率"],
      appPattern: "crm",
      entities: [{ name: "Lead", label: "线索", fields: [{ name: "name", label: "名称", type: "string", required: true }, { name: "status", label: "状态", type: "status", required: true }] }],
      pages: Array.from({ length: 6 }, (_, index) => ({ id: `page-${index}`, name: "页面", route: `/p${index}`, purpose: "展示核心业务信息", components: [{ type: "table", title: "列表" }] })),
      workflows: [{ title: "跟进线索", steps: ["创建线索", "更新状态"] }],
      decisions: [{ title: "轻量 CRM", decision: "使用列表和看板", reason: "匹配线索管理", tradeoff: "不支持复杂权限" }],
      seedData: { Lead: [] },
    })

    expect(result.success).toBe(false)
  })

  it("accepts only whitelisted tool names", () => {
    const result = agentActionSchema.safeParse({
      type: "tool",
      reasoningSummary: "需要先分析问题",
      toolName: "analyze_problem",
      arguments: { problem: "销售线索分散" },
    })

    expect(result.success).toBe(true)
  })
})
```

- [x] **Step 2: 运行测试**

Run: `npm run test -- src/server/contracts/contracts.test.ts`

Expected: 4 tests pass。

- [ ] **Step 3: 提交**

```bash
git add docs/plan/03-contracts-and-schemas.md src/server/contracts
git commit -m "feat: add ai output contracts"
```

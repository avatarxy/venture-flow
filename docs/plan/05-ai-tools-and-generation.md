# AI Tools And Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Strategy、Capability、Blueprint、Build、Review、Repair、Optimization 等受控 AI 工具。

**Architecture:** 每个工具优先定义为 Mastra `createTool`，使用 Zod 描述 inputSchema 和 outputSchema。需要模型生成的工具通过 Vercel AI SDK 调用 LLM，并在返回前通过 Zod 校验输出；本地校验工具不调用模型。生成应用严格使用固定文件结构和依赖白名单。

**Tech Stack:** Mastra、Vercel AI SDK、Zod、TypeScript、Vitest。

---

## 文件结构

```text
src/server/ai/model.ts
src/server/ai/json-output.ts
src/server/ai/generate-structured.ts
src/server/tools/analyze-problem.ts
src/server/tools/inspect-capabilities.ts
src/server/tools/create-blueprint.ts
src/server/tools/validate-blueprint.ts
src/server/tools/generate-application.ts
src/server/tools/inspect-build.ts
src/server/tools/repair-application.ts
src/server/tools/optimize-product.ts
src/server/tools/tool-suite.ts
src/server/tools/inspect-build.test.ts
src/server/generation/prompts/app-builder-prompt.ts
```

## Task 1: 创建 Vercel AI SDK 调用封装

**Files:**
- Create: `src/server/ai/model.ts`
- Create: `src/server/ai/json-output.ts`
- Create: `src/server/ai/generate-structured.ts`

- [x] **Step 1: 写模型入口**

```ts
import { openai } from "@ai-sdk/openai"

export const primaryModel = openai("gpt-4.1-mini")
```

- [x] **Step 2: 写 JSON 输出解析**

```ts
import type { z } from "zod"

export function parseStructuredJson<T>(schema: z.ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw)

  if (!result.success) {
    throw new Error(result.error.issues.map((issue) => issue.message).join("; "))
  }

  return result.data
}
```

- [x] **Step 3: 写结构化生成封装**

```ts
import { generateObject } from "ai"
import type { z } from "zod"
import { primaryModel } from "./model"

export async function generateStructuredObject<T>(input: {
  schema: z.ZodType<T>
  system: string
  prompt: string
}) {
  const result = await generateObject({
    model: primaryModel,
    schema: input.schema,
    system: input.system,
    prompt: input.prompt,
  })

  return parseStructuredJson(input.schema, result.object)
}
```

Audit hardening:

- `generateStructuredObject` 返回前再次通过传入 Zod Schema 校验，避免只信任 provider structured output。

- [x] **Step 4: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 2: 实现能力边界工具

**Files:**
- Create: `src/server/tools/inspect-capabilities.ts`

- [x] **Step 1: 写 Mastra tool**

```ts
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const inspectCapabilitiesOutputSchema = z.object({
  appPatterns: z.array(z.string()),
  maxPages: z.number().int(),
  maxEntities: z.number().int(),
  maxCoreFeatures: z.number().int(),
  allowedDependencies: z.array(z.string()),
  unsupported: z.array(z.string()),
})

export const inspectCapabilitiesTool = createTool({
  id: "inspect_capabilities",
  description: "读取 VentureFlow MVP 支持的应用类型、复杂度上限、依赖白名单和不支持能力。",
  inputSchema: z.object({}),
  outputSchema: inspectCapabilitiesOutputSchema,
  execute: async () => ({
    appPatterns: ["dashboard", "crm", "feedback-board", "task-manager", "content-planner", "booking-manager", "survey", "custom-crud"],
    maxPages: 5,
    maxEntities: 4,
    maxCoreFeatures: 7,
    allowedDependencies: ["react", "react-dom", "lucide-react", "recharts"],
    unsupported: [
      "实时多人协同编辑",
      "复杂支付结算",
      "任意后端运行环境",
      "任意 NPM 依赖",
      "原生移动应用",
    ],
  }),
})
```

- [x] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 3: 实现 Blueprint 校验工具

**Files:**
- Create: `src/server/tools/validate-blueprint.ts`
- Create: `src/server/tools/validate-blueprint.test.ts`

- [x] **Step 1: 写测试**

```ts
import { describe, expect, it } from "vitest"
import { validateBlueprintCapability } from "./validate-blueprint"

describe("validateBlueprintCapability", () => {
  it("rejects unsupported large blueprint", () => {
    const result = validateBlueprintCapability({
      pagesCount: 6,
      entitiesCount: 1,
      coreFeaturesCount: 3,
    })

    expect(result.passed).toBe(false)
    expect(result.issues[0]).toContain("页面数量")
  })
})
```

- [x] **Step 2: 实现校验和 Mastra tool**

```ts
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export function validateBlueprintCapability(input: {
  pagesCount: number
  entitiesCount: number
  coreFeaturesCount: number
}) {
  const issues: string[] = []

  if (input.pagesCount > 5) {
    issues.push("页面数量超过 MVP 上限 5 个")
  }

  if (input.entitiesCount > 4) {
    issues.push("实体数量超过 MVP 上限 4 个")
  }

  if (input.coreFeaturesCount > 7) {
    issues.push("核心功能数量超过 MVP 上限 7 个")
  }

  return {
    passed: issues.length === 0,
    issues,
  }
}

export const validateBlueprintTool = createTool({
  id: "validate_blueprint",
  description: "校验 Product Blueprint 是否落在 VentureFlow MVP 能力边界内。",
  inputSchema: z.object({
    pagesCount: z.number().int(),
    entitiesCount: z.number().int(),
    coreFeaturesCount: z.number().int(),
  }),
  outputSchema: z.object({
    passed: z.boolean(),
    issues: z.array(z.string()),
  }),
  execute: async (inputData) => validateBlueprintCapability(inputData),
})
```

- [x] **Step 3: 运行测试**

Run: `npm run test -- src/server/tools/validate-blueprint.test.ts`

Expected: 1 test passes。

## Task 4: 实现 Build 静态审查

**Files:**
- Create: `src/server/tools/inspect-build.ts`
- Create: `src/server/tools/inspect-build.test.ts`

- [x] **Step 1: 写测试**

```ts
import { describe, expect, it } from "vitest"
import { inspectBuild } from "./inspect-build"

describe("inspectBuild", () => {
  it("rejects build without App entry", () => {
    const result = inspectBuild({ summary: "bad", files: [{ path: "/index.tsx", content: "export {}" }] })

    expect(result.passed).toBe(false)
    expect(result.issues[0]?.type).toBe("missing_file")
  })

  it("rejects forbidden dependency", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "import axios from 'axios'; export default function App() { return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues[0]?.type).toBe("forbidden_dependency")
  })
})
```

- [x] **Step 2: 实现审查和 Mastra tool**

```ts
import { createTool } from "@mastra/core/tools"
import type { BuildOutput, ReviewResult } from "@/server/contracts"
import { buildOutputSchema, reviewResultSchema } from "@/server/contracts"

const forbiddenImports = ["axios", "fs", "path", "child_process", "http", "https"]

export function inspectBuild(build: BuildOutput): ReviewResult {
  const issues: ReviewResult["issues"] = []
  const appFile = build.files.find((file) => file.path === "/App.tsx")

  if (!appFile) {
    issues.push({ type: "missing_file", message: "缺少 /App.tsx 入口文件", severity: "high" })
  }

  for (const file of build.files) {
    for (const dependency of forbiddenImports) {
      if (file.content.includes(`from "${dependency}"`) || file.content.includes(`from '${dependency}'`)) {
        issues.push({ type: "forbidden_dependency", message: `禁止使用依赖 ${dependency}`, severity: "high" })
      }
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    recommendedFix: issues.length ? "移除禁止依赖并补齐入口文件" : undefined,
  }
}

export const inspectBuildTool = createTool({
  id: "inspect_build",
  description: "静态检查生成应用是否包含入口文件、是否使用禁用依赖，以及是否满足基础运行边界。",
  inputSchema: z.object({ build: buildInspectionInputSchema }),
  outputSchema: reviewResultSchema,
  execute: async (inputData) => inspectBuild(inputData.build),
})
```

Audit hardening:

- `inspectBuild` 使用宽松的 `buildInspectionInputSchema` 接收坏 build，确保可以返回 `missing_file` 等审查结果，而不是在输入 Schema 阶段短路。
- 静态审查覆盖禁用依赖、外部网络请求、宿主 DOM 访问、脚本注入风险和 localStorage 持久化。

- [x] **Step 3: 运行测试**

Run: `npm run test -- src/server/tools/inspect-build.test.ts`

Expected: 5 tests pass。

## Task 5: 实现 Strategy、Blueprint 和 Builder 工具骨架

**Files:**
- Create: `src/server/tools/analyze-problem.ts`
- Create: `src/server/tools/create-blueprint.ts`
- Create: `src/server/tools/generate-application.ts`
- Create: `src/server/generation/prompts/app-builder-prompt.ts`

- [x] **Step 1: 写 Builder Prompt**

```ts
export function createAppBuilderPrompt() {
  return `你是 VentureFlow 的 Builder Agent。
必须生成可在 Sandpack 中运行的 React 应用。
必须输出 JSON，格式为 { "summary": string, "files": [{ "path": string, "content": string }] }。
必须包含 /App.tsx。
允许依赖：react、react-dom、lucide-react、recharts。
禁止网络请求、禁止服务端代码、禁止动态安装依赖。
应用必须包含新增操作、状态变更或编辑操作、搜索/筛选/排序中的至少一种，并使用 localStorage 持久化。`
}
```

- [x] **Step 2: 写 Vercel AI SDK Builder 执行函数**

```ts
import type { ProductBlueprint } from "@/server/contracts"
import { buildOutputSchema } from "@/server/contracts"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { createAppBuilderPrompt } from "@/server/generation/prompts/app-builder-prompt"

export async function generateApplication(blueprint: ProductBlueprint) {
  const build = await generateStructuredObject({
    schema: buildOutputSchema,
    system: createAppBuilderPrompt(),
    prompt: JSON.stringify(blueprint, null, 2),
  })

  if (!build.files.some((file) => file.path === "/App.tsx")) {
    throw new Error("生成结果缺少 /App.tsx")
  }

  return build
}
```

- [x] **Step 3: 在同一文件包装为 Mastra Builder Tool**

```ts
import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { buildOutputSchema, productBlueprintSchema } from "@/server/contracts"

export const generateApplicationTool = createTool({
  id: "generate_application",
  description: "基于已校验的 Product Blueprint 生成可在 Sandpack 中运行的 React 应用文件。",
  inputSchema: z.object({
    blueprint: productBlueprintSchema,
  }),
  outputSchema: buildOutputSchema,
  execute: async (inputData) => generateApplication(inputData.blueprint),
})
```

- [x] **Step 4: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 6: 注册工具套件

**Files:**
- Create: `src/server/tools/tool-suite.ts`

- [x] **Step 1: 写 Mastra 工具套件**

```ts
import { createToolRegistry } from "@/server/agent/tool-registry"
import { inspectBuildTool } from "./inspect-build"
import { inspectCapabilitiesTool } from "./inspect-capabilities"
import { validateBlueprintTool } from "./validate-blueprint"
import { generateApplicationTool } from "./generate-application"

export const mastraTools = {
  analyzeProblemTool,
  inspectCapabilitiesTool,
  createBlueprintTool,
  validateBlueprintTool,
  generateApplicationTool,
  inspectBuildTool,
  repairApplicationTool,
  optimizeProductTool,
}

export function createVentureFlowToolSuite() {
  return createToolRegistry([
    {
      name: "inspect_build",
      async execute(args) {
        const result = inspectBuild((args.build ?? state.build) as never)
        return {
          summary: result.passed ? "Build inspection passed" : "Build inspection failed",
          statePatch: { review: result },
        }
      },
    },
  ])
}
```

Audit hardening:

- 工具套件覆盖 `analyze_problem`、`inspect_capabilities`、`create_blueprint`、`validate_blueprint`、`generate_application`、`inspect_build`、`repair_application` 和 `optimize_product`。
- `src/server/mastra/index.ts` 注册 `mastraTools`，Mastra 调试入口和 Runtime registry 共用同一组工具实现。

- [x] **Step 2: 运行验证**

Run: `npm run typecheck && npm run test -- src/server/tools`

Expected: typecheck 通过，tools 测试通过。

- [x] **Step 3: 提交**

```bash
git add src/server/ai src/server/tools src/server/generation
git commit -m "feat: add controlled ai tools"
```

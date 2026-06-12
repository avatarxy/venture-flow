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
src/server/tools/modify-blueprint.ts           # 对话式新增：增量修改 Blueprint
src/server/tools/regenerate-page.ts            # 对话式新增：重新生成页面
src/server/tools/tool-suite.ts
src/server/tools/inspect-build.test.ts
src/server/generation/prompts/app-builder-prompt.ts
src/server/generation/prompts/modify-blueprint-prompt.ts  # 对话式新增
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

---

## Task 7: 实现对话式增量修改工具

> 以下工具为对话式交互新增。它们使 Agent 能够在用户干预下对已有的 Strategy/Blueprint/Build 进行增量修改，而不是全量重新生成。

**Files:**
- Create: `src/server/tools/modify-blueprint.ts`
- Create: `src/server/tools/modify-blueprint.test.ts`
- Create: `src/server/tools/regenerate-page.ts`
- Create: `src/server/tools/regenerate-page.test.ts`

**Tech Stack:** Mastra、Vercel AI SDK、Zod、TypeScript、Vitest。

### Step 1: 实现 modify_blueprint 工具

**目标**：基于用户自然语言指令修改已有的 Product Blueprint，保留未提及的部分。

- [ ] **写 Modify Blueprint Prompt**

```ts
export function createModifyBlueprintPrompt() {
  return `你是 VentureFlow 的 Blueprint 修改 Agent。
你会收到一份当前 Blueprint 和一条用户修改指令。
请只修改用户明确提到的部分，保留所有未提及的字段和结构。
确保修改后的 Blueprint 仍然在 MVP 能力边界内：
- 实体不超过 4 个
- 页面不超过 5 个
- 核心功能不超过 7 个
- appPattern 必须是受支持的类型之一

输出完整的 Product Blueprint JSON。`
}
```

- [ ] **写 modifyBlueprint 函数**

```ts
import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { productBlueprintSchema } from "@/server/contracts"
import { createModifyBlueprintPrompt } from "@/server/generation/prompts/modify-blueprint-prompt"
import { generationSafetyConstraints } from "@/server/generation/prompts/app-builder-prompt"

export const modifyBlueprintInputSchema = z.object({
  blueprint: productBlueprintSchema,
  instruction: z.string().min(3).describe("用户修改指令，如'再加一个 Contact 实体'"),
})

export async function modifyBlueprint(input: z.infer<typeof modifyBlueprintInputSchema>) {
  return generateStructuredObject({
    schema: productBlueprintSchema,
    system: createModifyBlueprintPrompt() + "\n\n" + generationSafetyConstraints,
    prompt: `当前 Blueprint：\n${JSON.stringify(input.blueprint, null, 2)}\n\n用户修改指令：${input.instruction}`,
  })
}

export const modifyBlueprintTool = createTool({
  id: "modify_blueprint",
  description: "基于用户自然语言指令增量修改 Product Blueprint，保留未提及的部分。",
  strict: true,
  inputSchema: modifyBlueprintInputSchema,
  outputSchema: productBlueprintSchema,
  execute: async (inputData) => modifyBlueprint(inputData),
})
```

- [ ] **写测试**

```ts
describe("modifyBlueprint", () => {
  it("receives current blueprint and user instruction", async () => {
    // 验证 inputSchema 包含 blueprint + instruction
    const result = modifyBlueprintInputSchema.safeParse({
      blueprint: validBlueprint,
      instruction: "再加一个 Contact 实体",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty instruction", () => {
    const result = modifyBlueprintInputSchema.safeParse({
      blueprint: validBlueprint,
      instruction: "",
    })
    expect(result.success).toBe(false)
  })
})
```

### Step 2: 实现 regenerate_page 工具

**目标**：基于用户反馈重新生成应用中的某个页面，保留其他页面不变。

- [ ] **写 regeneratePage 函数**

```ts
import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { buildOutputSchema, productBlueprintSchema } from "@/server/contracts"

export const regeneratePageInputSchema = z.object({
  blueprint: productBlueprintSchema,
  build: z.object({
    summary: z.string(),
    files: z.array(z.object({ path: z.string(), content: z.string() })),
  }),
  targetPage: z.string().min(1).describe("目标页面名称或路由"),
  instruction: z.string().min(3).describe("用户反馈，如'搜索功能改成实时筛选'"),
})

export async function regeneratePage(input: z.infer<typeof regeneratePageInputSchema>) {
  return generateStructuredObject({
    schema: buildOutputSchema,
    system: `你是 VentureFlow 的页面修复 Agent。
只修改用户指定的页面文件，所有其他文件保持不变。
${generationSafetyConstraints}`,
    prompt: JSON.stringify({
      blueprint: input.blueprint,
      currentBuild: input.build.summary,
      targetPage: input.targetPage,
      instruction: input.instruction,
      allFiles: input.build.files.map(f => ({ path: f.path })),
    }, null, 2),
  })
}

export const regeneratePageTool = createTool({
  id: "regenerate_page",
  description: "基于用户反馈重新生成应用中的指定页面，保留其他页面不变。",
  strict: true,
  inputSchema: regeneratePageInputSchema,
  outputSchema: buildOutputSchema,
  execute: async (inputData) => regeneratePage(inputData),
})
```

- [ ] **写测试**

```ts
describe("regeneratePage", () => {
  it("receives blueprint, build, target page and instruction", async () => {
    const result = regeneratePageInputSchema.safeParse({
      blueprint: validBlueprint,
      build: { summary: "ok", files: [{ path: "/App.tsx", content: "..." }] },
      targetPage: "线索列表",
      instruction: "搜索功能改成实时筛选，不要搜索按钮",
    })
    expect(result.success).toBe(true)
  })
})
```

### Step 3: 注册增量工具

- [ ] **更新 Mastra tools 导出**

```ts
// 在 src/server/tools/tool-suite.ts 的 mastraTools 中新增
export const mastraTools = {
  // ... 现有工具 ...
  modifyBlueprintTool,
  regeneratePageTool,
}
```

### Step 4: 运行验证

Run: `npm run typecheck && npm run test -- src/server/tools/modify-blueprint.test.ts src/server/tools/regenerate-page.test.ts`

Expected: typecheck 通过，2 个测试文件通过。

---

## 对话式工具清单（全部）

| 工具名 | 类型 | 触发方式 | 说明 |
|--------|------|---------|------|
| `analyze_problem` | LLM | Agent 自主 | 分析业务问题 → Strategy |
| `inspect_capabilities` | 本地 | Agent 自主 | 查询平台能力边界 |
| `create_blueprint` | LLM | Agent 自主 | 生成 Product Blueprint |
| `validate_blueprint` | 本地 | Agent 自主 | 校验 Blueprint 能力边界 |
| `modify_blueprint` | LLM | **用户触发** | 增量修改 Blueprint（基于用户指令） |
| `generate_application` | LLM | Agent 自主 | 生成 Sandpack React 应用 |
| `regenerate_page` | LLM | **用户触发** | 基于用户反馈重新生成某页面 |
| `inspect_build` | 本地 | Agent 自主 | 静态审查生成应用安全边界 |
| `repair_application` | LLM | Agent 自主 | 自动修复审查问题 |
| `optimize_product` | LLM | Agent 自主 | 基于 Usage Events 生成优化建议 |
| `finish_task` | 系统 | Agent 自主/用户触发 | 完成校验并标记完成 |


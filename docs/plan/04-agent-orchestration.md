# Agent Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现有边界的 Autonomous Supervisor Agent，支持工具白名单、运行循环、状态持久化、预算限制和完成条件校验。

**Architecture:** Mastra 提供 Agent/Tool 抽象、工具描述和本地调试入口；VentureFlow 自定义 Supervisor Runtime 基于 AgentState 控制最大步数、工具白名单、状态持久化和完成条件。Supervisor 不直接执行业务逻辑，而是基于 AgentState 决定下一步工具调用；平台执行工具并保存结果。

**Tech Stack:** Mastra、Vercel AI SDK、TypeScript、Zod、Prisma、Vitest、Next.js Route Handlers。

---

## 文件结构

```text
src/server/agent/constants.ts
src/server/agent/can-finish.ts
src/server/agent/tool-registry.ts
src/server/agent/supervisor.ts
src/server/agent/state-factory.ts
src/server/agent/supervisor.test.ts
src/server/mastra/index.ts
src/server/mastra/agents/supervisor-agent.ts
src/server/mastra/instructions/supervisor-instructions.ts
src/app/api/projects/[projectId]/agent/run/route.ts
src/app/api/projects/[projectId]/agent/state/route.ts
src/app/api/projects/[projectId]/agent/stop/route.ts
```

## Task 1: 定义 Agent 常量和完成条件

**Files:**
- Create: `src/server/agent/constants.ts`
- Create: `src/server/agent/can-finish.ts`
- Create: `src/server/agent/can-finish.test.ts`

- [x] **Step 1: 写常量**

```ts
export const MAX_AGENT_STEPS = 12
export const MAX_BUILD_ATTEMPTS = 2
export const MAX_REPAIR_ATTEMPTS = 1
```

- [x] **Step 2: 写完成条件测试**

```ts
import { describe, expect, it } from "vitest"
import { canFinish } from "./can-finish"

describe("canFinish", () => {
  it("rejects state without review pass", () => {
    expect(canFinish({
      strategy: {} as never,
      blueprint: {} as never,
      build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
      review: { passed: false, issues: [], recommendedFix: "修复缺失交互" },
    })).toBe(false)
  })

  it("accepts state with required outputs", () => {
    expect(canFinish({
      strategy: {} as never,
      blueprint: {} as never,
      build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
      review: { passed: true, issues: [] },
    })).toBe(true)
  })
})
```

- [x] **Step 3: 实现完成条件**

```ts
import type { AgentState } from "@/server/contracts"

export function canFinish(state: Pick<AgentState, "strategy" | "blueprint" | "build" | "review">) {
  const hasAppEntry = Boolean(state.build?.files.some((file) => file.path === "/App.tsx"))

  return Boolean(
    state.strategy &&
      state.blueprint &&
      state.build?.files.length &&
      hasAppEntry &&
      state.review?.passed,
  )
}
```

Audit hardening:

- `canFinish` 使用 Strategy、Blueprint、Build 和 Review 的 Zod Schema 做最终校验。
- Build 必须通过 contract 层 `/App.tsx` 和文件路径约束。
- AgentState 支持 `stopped` 状态，用于用户主动停止运行。

- [x] **Step 4: 运行测试**

Run: `npm run test -- src/server/agent/can-finish.test.ts`

Expected: 2 tests pass。

## Task 2: 创建初始 AgentState

**Files:**
- Create: `src/server/agent/state-factory.ts`
- Create: `src/server/agent/state-factory.test.ts`

- [x] **Step 1: 写测试**

```ts
import { describe, expect, it } from "vitest"
import { createInitialAgentState } from "./state-factory"

describe("createInitialAgentState", () => {
  it("creates planning state with default plan", () => {
    const state = createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进")

    expect(state.status).toBe("planning")
    expect(state.currentPlan).toHaveLength(6)
    expect(state.buildAttempts).toBe(0)
    expect(state.repairAttempts).toBe(0)
  })
})
```

- [x] **Step 2: 实现 state factory**

```ts
import type { AgentState } from "@/server/contracts"

export function createInitialAgentState(projectId: string, originalProblem: string): AgentState {
  return {
    projectId,
    originalProblem,
    goal: "将业务问题转化为可运行、可分析、可迭代的业务应用",
    currentPlan: [
      { title: "分析业务问题", status: "pending" },
      { title: "检查平台能力边界", status: "pending" },
      { title: "生成产品蓝图", status: "pending" },
      { title: "校验产品蓝图", status: "pending" },
      { title: "生成可运行应用", status: "pending" },
      { title: "审查并完成任务", status: "pending" },
    ],
    currentStep: 0,
    toolCalls: [],
    buildAttempts: 0,
    repairAttempts: 0,
    totalTokens: 0,
    status: "planning",
  }
}
```

- [x] **Step 3: 运行测试**

Run: `npm run test -- src/server/agent/state-factory.test.ts`

Expected: 1 test passes。

## Task 3: 创建 Mastra Supervisor Agent

**Files:**
- Create: `src/server/mastra/instructions/supervisor-instructions.ts`
- Create: `src/server/mastra/agents/supervisor-agent.ts`
- Create: `src/server/mastra/index.ts`

- [x] **Step 1: 写 Supervisor instructions**

```ts
export const supervisorInstructions = `
你是 VentureFlow 的 Autonomous Supervisor Agent。
目标：将用户业务问题转化为 Strategy、Product Blueprint、可运行应用和 Review 结果。

你必须遵守：
1. 只调用已注册的 Mastra tools。
2. 不直接生成不符合 Schema 的最终结果。
3. 遇到能力边界超限时，优先降级 Blueprint。
4. 不进行无限修复；修复预算由 VentureFlow Runtime 控制。
5. 当你认为任务完成时，只能申请 finish_task，由系统执行最终校验。

输出给用户的说明只能是简短 reasoningSummary，不暴露私有推理链。
`
```

- [x] **Step 2: 创建 Supervisor Agent**

```ts
import { Agent } from "@mastra/core/agent"
import { supervisorInstructions } from "../instructions/supervisor-instructions"

export const supervisorAgent = new Agent({
  id: "ventureflow-supervisor",
  name: "VentureFlow Supervisor Agent",
  instructions: supervisorInstructions,
  model: "openai/gpt-4.1-mini",
})
```

- [x] **Step 3: 注册 Mastra 实例**

```ts
import { Mastra } from "@mastra/core"
import { supervisorAgent } from "./agents/supervisor-agent"

export const mastra = new Mastra({
  agents: {
    supervisorAgent,
  },
})
```

- [x] **Step 4: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 4: 实现 Mastra 工具注册表适配层

**Files:**
- Create: `src/server/agent/tool-registry.ts`

- [x] **Step 1: 写 Runtime 工具接口**

```ts
import type { AgentState, ToolName } from "@/server/contracts"

export type AgentToolResult = {
  summary: string
  statePatch: Partial<AgentState>
}

export type AgentTool = {
  name: ToolName
  execute: (args: Record<string, unknown>, state: AgentState) => Promise<AgentToolResult>
}

export function createToolRegistry(tools: AgentTool[]) {
  const registry = new Map(tools.map((tool) => [tool.name, tool]))

  return {
    get(toolName: ToolName) {
      const tool = registry.get(toolName)

      if (!tool) {
        throw new Error(`Tool is not registered: ${toolName}`)
      }

      return tool
    },
  }
}
```

- [x] **Step 2: 说明职责边界**

```ts
// Mastra tools 负责输入输出 Schema、工具描述和工具执行。
// Runtime registry 负责按 VentureFlow 的工具白名单查找工具，并把结果转换成 AgentState patch。
```

Audit hardening:

- Supervisor 优先通过 Runtime registry 执行工具，工具返回 `summary` 作为 Observation。
- 直接 executor 仅作为测试或适配层入口，仍需返回受控 `AgentToolResult`。

- [x] **Step 3: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 5: 实现 Supervisor Loop

**Files:**
- Create: `src/server/agent/supervisor.ts`
- Create: `src/server/agent/supervisor.test.ts`

- [x] **Step 1: 写 loop 测试**

```ts
import { describe, expect, it } from "vitest"
import { createInitialAgentState } from "./state-factory"
import { runSupervisorWithDecisionProvider } from "./supervisor"

describe("supervisor", () => {
  it("stops when finish is requested and canFinish passes", async () => {
    const initial = {
      ...createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"),
      strategy: {} as never,
      blueprint: {} as never,
      build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
      review: { passed: true, issues: [] },
    }

    const result = await runSupervisorWithDecisionProvider(initial, {
      decide: async () => ({ type: "finish", reasoningSummary: "产物已齐全" }),
      executeTool: async () => {
        throw new Error("finish should not execute tools")
      },
      save: async () => undefined,
    })

    expect(result.status).toBe("completed")
  })
})
```

- [x] **Step 2: 实现 Supervisor**

```ts
import type { AgentAction, AgentState } from "@/server/contracts"
import { canFinish } from "./can-finish"
import { MAX_AGENT_STEPS } from "./constants"

type SupervisorRuntime = {
  decide: (state: AgentState) => Promise<AgentAction>
  executeTool: (action: Extract<AgentAction, { type: "tool" }>, state: AgentState) => Promise<Partial<AgentState>>
  save: (state: AgentState) => Promise<void>
}

export async function runSupervisorWithDecisionProvider(initialState: AgentState, runtime: SupervisorRuntime) {
  let state: AgentState = { ...initialState, status: "executing" }

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    const decision = await runtime.decide(state)

    if (decision.type === "finish") {
      if (canFinish(state)) {
        state = { ...state, status: "completed" }
        await runtime.save(state)
        return state
      }

      state = {
        ...state,
        toolCalls: [
          ...state.toolCalls,
          {
            toolName: "finish_task",
            reasoningSummary: decision.reasoningSummary,
            argumentsSummary: "{}",
            resultSummary: "完成条件未通过",
            status: "failed",
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
          },
        ],
      }
      await runtime.save(state)
      continue
    }

    const patch = await runtime.executeTool(decision, state)
    state = { ...state, ...patch, currentStep: step + 1 }
    await runtime.save(state)
  }

  state = { ...state, status: canFinish(state) ? "completed" : "failed" }
  await runtime.save(state)
  return state
}
```

Audit hardening:

- `decide` 返回值必须通过 `agentActionSchema` 校验后才能执行。
- 工具返回的 state patch 合并后必须通过 `agentStateSchema` 校验后才能保存。
- `generate_application` 和 `repair_application` 分别受 `MAX_BUILD_ATTEMPTS` 与 `MAX_REPAIR_ATTEMPTS` 限制。
- 工具调用失败、预算耗尽、决策非法都会写入 `toolCalls` 观察记录。

- [x] **Step 3: 运行测试**

Run: `npm run test -- src/server/agent/supervisor.test.ts`

Expected: 1 test passes。

## Task 6: 添加 Agent API Routes

**Files:**
- Create: `src/app/api/projects/[projectId]/agent/run/route.ts`
- Create: `src/app/api/projects/[projectId]/agent/state/route.ts`
- Create: `src/app/api/projects/[projectId]/agent/stop/route.ts`

- [x] **Step 1: 写 run route**

```ts
import { NextResponse } from "next/server"
import { saveAgentState } from "@/server/agent-state/agent-state-repository"
import { createInitialAgentState } from "@/server/agent/state-factory"
import { getProject } from "@/server/projects/project-repository"

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const agentState = project.agentState ?? await saveAgentState(createInitialAgentState(project.id, project.originalProblem))

  return NextResponse.json({ projectId, status: "accepted", agentStateStatus: agentState.status })
}
```

- [x] **Step 2: 写 state route**

```ts
import { NextResponse } from "next/server"
import { getProject } from "@/server/projects/project-repository"

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ agentState: project.agentState })
}
```

- [x] **Step 3: 写 stop route**

```ts
import { NextResponse } from "next/server"
import { saveAgentState, stopAgentState } from "@/server/agent-state/agent-state-repository"
import { createInitialAgentState } from "@/server/agent/state-factory"
import { getProject } from "@/server/projects/project-repository"

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.agentState) {
    await stopAgentState(projectId)
  } else {
    await saveAgentState({ ...createInitialAgentState(project.id, project.originalProblem), status: "stopped" })
  }

  return NextResponse.json({ projectId, status: "stopped" })
}
```

Audit hardening:

- `run` route 会为新项目创建并持久化初始 AgentState，不再只返回静态 accepted。
- `stop` route 会将已存在 AgentState 标记为 `stopped`，没有状态时会创建 stopped 初始状态。
- AgentState Prisma model 增加 `originalProblem`、`goal`、`strategy`、`blueprint`、`build`、`review`，支持恢复完整 Agent 上下文。

- [x] **Step 4: 运行验证**

Run: `npm run typecheck && npm run test -- src/server/agent`

Expected: typecheck 通过，agent 测试通过。

- [x] **Step 5: 提交**

```bash
git add src/server/agent src/server/mastra src/app/api/projects
git commit -m "feat: add bounded agent supervisor"
```

# Agent Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 "自主管道 + 对话干预" 混合模式的 Supervisor Agent。Agent 默认自主执行 Strategy → Blueprint → Build 管道，用户可以随时通过对话消息干预——修改、重做、跳过或确认完成。

**Architecture:** Mastra 提供 Agent/Tool 抽象、工具描述和本地调试入口；VentureFlow 自定义 Supervisor Runtime 基于 AgentState 控制最大步数、工具白名单、状态持久化、对话中断和恢复。Supervisor 不直接执行业务逻辑，而是基于 AgentState 和用户消息决定下一步工具调用；平台执行工具并保存结果。

**Tech Stack:** Mastra、Vercel AI SDK、TypeScript、Zod、Prisma、Vitest、Next.js Route Handlers、SSE。

**Core Design Principle:** 对话是用户的主入口，Agent 自主管道是默认行为。两者不矛盾——Agent 每步执行完发一条消息到聊天流，用户可选择沉默（Agent 继续）或发言（Agent 响应干预）。

---

## 文件结构

```text
src/server/agent/constants.ts
src/server/agent/can-finish.ts
src/server/agent/tool-registry.ts
src/server/agent/supervisor.ts              # 修改：增加 handleUserMessage + handleIntervention
src/server/agent/state-factory.ts
src/server/agent/user-intent.ts             # 新增：用户意图解析
src/server/agent/user-intent.test.ts
src/server/agent/supervisor.test.ts
src/server/mastra/index.ts
src/server/mastra/agents/supervisor-agent.ts
src/server/mastra/instructions/supervisor-instructions.ts
src/server/mastra/instructions/user-intent-instructions.ts  # 新增
src/app/api/projects/[projectId]/agent/messages/route.ts   # 新增：对话消息 API
src/app/api/projects/[projectId]/agent/run/route.ts
src/app/api/projects/[projectId]/agent/state/route.ts
src/app/api/projects/[projectId]/agent/stop/route.ts
```

## Task 1: 定义 Agent 常量和完成条件

**Files:**
- Modify: `src/server/agent/constants.ts`
- Modify: `src/server/agent/can-finish.ts`
- Modify: `src/server/agent/can-finish.test.ts`

- [x] **Step 1: 写常量**（保持现有实现，新增用户允许确认）

```ts
export const MAX_AGENT_STEPS = 12
export const MAX_BUILD_ATTEMPTS = 2
export const MAX_REPAIR_ATTEMPTS = 1

// 对话式新增：Agent 可以在以下步骤后主动询问用户
export const STEPS_THAT_CAN_WAIT_FOR_USER = [
  "analyze_problem",
  "create_blueprint",
  "generate_application",
  "repair_application",
]
```

- [ ] **Step 2: 写完成条件**（保持现有 `canFinish`，增加对话式 `canFinishByUserAccept`）

```ts
import type { AgentState } from "@/server/contracts"

// 管道自然完成条件（不变）
export function canFinish(state: Pick<AgentState, "strategy" | "blueprint" | "build" | "review">) {
  const hasAppEntry = Boolean(state.build?.files.some((file) => file.path === "/App.tsx"))
  return Boolean(
    state.strategy &&
    state.blueprint &&
    state.build?.files.length &&
    state.review?.passed &&
    hasAppEntry,
  )
}

// 对话式新增：用户可以主动确认完成
export function canFinishByUserAccept(state: Pick<AgentState, "build" | "review">): boolean {
  // 用户确认完成的要求比管道低——至少需要有 build
  return Boolean(state.build?.files.length)
}
```

- [ ] **Step 3: 运行测试**

Run: `npm run test -- src/server/agent/can-finish.test.ts`

Expected: 3 tests pass。

## Task 2: 扩展 AgentState 支持对话状态

**Files:**
- Modify: `src/server/contracts/agent.ts`

- [ ] **Step 1: 扩展 AgentState Schema**

在现有 `agentStateSchema` 中新增/修改以下字段：

```ts
export const agentStateSchema = z.object({
  // ... 现有字段保持不变 ...

  // 对话式新增字段
  status: z.enum([
    "planning",
    "executing",
    "waiting_for_user",  // 新增：产出结果后等待用户反馈
    "completed",
    "failed",
    "stopped",
  ]),
  lastUserMessage: z.string().optional(),       // 最近一条用户消息
  lastUserIntent: userIntentSchema.optional(),  // 解析出的用户意图
  waitingForStep: z.string().optional(),        // 当前等待用户确认的步骤名
})
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 3: 实现用户意图解析

**Files:**
- Create: `src/server/mastra/instructions/user-intent-instructions.ts`
- Create: `src/server/agent/user-intent.ts`
- Create: `src/server/agent/user-intent.test.ts`

- [ ] **Step 1: 定义意图 Schema**

```ts
import { z } from "zod"

export const userIntentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("continue"),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("modify_blueprint"),
    instruction: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("redo_blueprint"),
    instruction: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("regenerate_page"),
    targetPage: z.string().min(1),
    instruction: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("skip_to_build"),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("accept"),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("unknown"),
    rawMessage: z.string(),
    confidence: z.number().min(0).max(1),
  }),
])

export type UserIntent = z.infer<typeof userIntentSchema>
```

- [ ] **Step 2: 写意图解析指令**

```ts
export function createUserIntentInstructions(state: AgentState) {
  return `你是 VentureFlow 的意图解析器。

当前 Agent 状态：
- 已完成步骤：${state.currentPlan.filter(p => p.status === "completed").map(p => p.title).join(", ") || "无"}
- 当前状态：${state.status}
- 是否有 Blueprint：${state.blueprint ? "是" : "否"}
- 是否有 Build：${state.build ? "是" : "否"}

根据用户消息，判断意图类型：

1. continue — 用户表示可以继续（"继续"、"好的"、"go on"、"下一步"）
2. modify_blueprint — 用户要修改 Blueprint（"加一个实体"、"去掉这个页面"、"改成..."），提取具体指令
3. redo_blueprint — 用户要重做 Blueprint（"全部重做"、"Blueprint 不对，重新生成"）
4. regenerate_page — 用户要重新生成某个页面（"搜索功能不好用"、"仪表盘样式改一下"），提取目标页面
5. skip_to_build — 用户要跳过当前步骤直接生成（"直接生成看看"、"跳过分析"）
6. accept — 用户确认完成（"可以了"、"就这样"、"够了"、"发布"）
7. unknown — 无法识别意图`

  // 解析用户意图，通过 generateStructuredObject 调用 LLM
  return parseUserIntent(userMessage, state)
}
```

- [ ] **Step 3: 写测试**

```ts
describe("parseUserIntent", () => {
  it("recognizes continue intent", () => { /* ... */ })
  it("recognizes modify_blueprint intent with instruction", () => { /* ... */ })
  it("recognizes accept intent", () => { /* ... */ })
  it("returns unknown for ambiguous messages", () => { /* ... */ })
})
```

- [ ] **Step 4: 运行测试**

Run: `npm run test -- src/server/agent/user-intent.test.ts`

Expected: 4 tests pass。

## Task 4: 实现对话式 Supervisor

**Files:**
- Modify: `src/server/agent/supervisor.ts`
- Modify: `src/server/agent/supervisor.test.ts`

- [ ] **Step 1: 实现 handleUserMessage**

```ts
/**
 * 对话式 Supervisor 主入口
 * 接收用户消息，返回 Agent 响应（包含下一步行动和用户可见的消息卡片）
 */
export async function handleUserMessage(
  projectId: string,
  userMessage: string,
): Promise<AgentResponse> {
  const state = await loadAgentState(projectId)

  // 记录用户消息
  await saveChatMessage({
    projectId,
    role: "user",
    type: "user-text",
    content: userMessage,
  })

  // 如果 Agent 正在等待用户反馈，处理干预
  if (state.status === "waiting_for_user") {
    return handleIntervention(state, userMessage)
  }

  // 否则启动/继续自主管道
  state.lastUserMessage = userMessage
  return runAgentStep(state)
}
```

- [ ] **Step 2: 实现 handleIntervention**

```ts
async function handleIntervention(
  state: AgentState,
  userMessage: string,
): Promise<AgentResponse> {
  const intent = await parseUserIntent(userMessage, state)
  state.lastUserIntent = intent

  switch (intent.type) {
    case "continue":
      state.status = "executing"
      return runAgentStep(state)

    case "modify_blueprint":
      return executeInterventionTool(state, {
        toolName: "modify_blueprint",
        arguments: { blueprint: state.blueprint, instruction: intent.instruction },
      })

    case "redo_blueprint":
      return executeInterventionTool(state, {
        toolName: "create_blueprint",
        arguments: {
          originalProblem: state.originalProblem,
          strategy: state.strategy,
          additionalInstruction: intent.instruction,
        },
      })

    case "regenerate_page":
      return executeInterventionTool(state, {
        toolName: "regenerate_page",
        arguments: {
          blueprint: state.blueprint,
          build: state.build,
          targetPage: intent.targetPage,
          instruction: intent.instruction,
        },
      })

    case "skip_to_build":
      return fastForwardTo(state, "generate_application")

    case "accept":
      state.status = "completed"
      return markCompleted(state)

    case "unknown":
      // 无法识别意图时，当作普通对话消息返回
      return {
        state,
        message: { role: "agent", type: "agent-question", content: "抱歉，我不太确定你的意思。你可以试试说"继续"、"修改 Blueprint"、"直接生成应用"或者"就这样吧"。", metadata: null },
        status: "waiting_for_user",
      }
  }
}
```

- [ ] **Step 3: 实现 runAgentStep（单步自主执行）**

```ts
/**
 * 自主管道单步执行
 * Agent 自行决定下一步工具，执行后生成消息卡片，判断是否需要等待用户
 */
async function runAgentStep(state: AgentState): Promise<AgentResponse> {
  if (state.currentStep >= MAX_AGENT_STEPS) {
    return handleMaxStepsReached(state)
  }

  const decision = await decideNextAction(state)

  if (decision.type === "finish") {
    if (canFinish(state)) {
      return markCompleted(state)
    }
    // 管道未完成但 Agent 想结束，进入 wait_for_user
    state.status = "waiting_for_user"
    return {
      state,
      message: { role: "agent", type: "agent-question", content: "我已经完成了部分分析，但还需要更多信息。要继续吗？", metadata: null },
      status: "waiting_for_user",
    }
  }

  // 执行工具
  const result = await executeAllowedTool(decision.toolName, decision.arguments, state)
  state = applyToolResult(state, decision, result)
  await saveAgentState(state)

  // 生成消息卡片
  const message = buildAgentMessage(state, result)

  // 判断是否在可等待的步骤处暂停
  if (STEPS_THAT_CAN_WAIT_FOR_USER.includes(decision.toolName)) {
    state.status = "waiting_for_user"
    state.waitingForStep = decision.toolName
    return { state, message, status: "waiting_for_user" }
  }

  // 继续执行下一步
  state.currentStep++
  return { state, message, status: "executing" }
}
```

- [ ] **Step 4: 实现消息卡片生成**

```ts
function buildAgentMessage(state: AgentState, toolResult: ToolResult): ChatMessage {
  switch (toolResult.toolName) {
    case "analyze_problem":
      return {
        role: "agent",
        type: "agent-strategy",
        content: `## 业务分析完成\n\n**问题：**${state.strategy?.problemSummary}\n**推荐方案：**${state.strategy?.recommendedAppPattern}`,
        metadata: state.strategy,
      }
    case "create_blueprint":
      return {
        role: "agent",
        type: "agent-blueprint",
        content: `## Product Blueprint\n\n**实体：**${state.blueprint?.entities.map(e => e.label).join(", ")}（${state.blueprint?.entities.length}个）\n**页面：**${state.blueprint?.pages.length}个`,
        metadata: state.blueprint,
      }
    case "generate_application":
      return {
        role: "agent",
        type: "agent-build",
        content: "## 应用已生成\n\n已生成可在 Sandpack 中运行的应用，请查看右侧预览。",
        metadata: { fileCount: state.build?.files.length },
      }
    case "inspect_build":
      return {
        role: "agent",
        type: "agent-review",
        content: state.review?.passed
          ? "## ✅ 审查通过\n\n应用满足所有安全和功能要求。"
          : `## ⚠️ 审查未通过\n\n${state.review?.issues.map(i => `- ${i.message}`).join("\n")}`,
        metadata: state.review,
      }
    default:
      return {
        role: "agent",
        type: "system-info",
        content: `执行完成：${toolResult.toolName}`,
        metadata: null,
      }
  }
}
```

- [ ] **Step 5: 写 supervisor 测试**

```ts
describe("handleUserMessage", () => {
  it("starts autonomous pipeline on first message", () => { /* ... */ })
  it("waits for user after create_blueprint step", () => { /* ... */ })
  it("handles modify_blueprint intervention", () => { /* ... */ })
  it("handles skip_to_build intervention", () => { /* ... */ })
  it("handles user accept to finish", () => { /* ... */ })
  it("continues pipeline after user says continue", () => { /* ... */ })
})
```

- [ ] **Step 6: 运行测试**

Run: `npm run test -- src/server/agent/supervisor.test.ts`

Expected: 6 tests pass。

## Task 5: 实现对话消息 API

**Files:**
- Create: `src/app/api/projects/[projectId]/agent/messages/route.ts`
- Create: `src/server/agent/message-store.ts`

- [ ] **Step 1: 写 ChatMessage 存储**

```ts
import { prisma } from "@/server/db/client"
import type { ChatMessage } from "@/server/contracts/chat-message"

export async function saveChatMessage(message: Omit<ChatMessage, "id" | "createdAt">) {
  return prisma.chatMessage.create({ data: message })
}

export async function getChatMessages(projectId: string) {
  return prisma.chatMessage.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  })
}
```

- [ ] **Step 2: 写 Message API Route（POST）**

```ts
import { NextResponse } from "next/server"
import { handleUserMessage } from "@/server/agent/supervisor"
import { getChatMessages, saveChatMessage } from "@/server/agent/message-store"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  const { message } = await request.json()

  if (!message || typeof message !== "string" || message.length < 2) {
    return NextResponse.json({ error: "消息不能为空" }, { status: 400 })
  }

  const response = await handleUserMessage(projectId, message)

  return NextResponse.json({
    agentMessage: response.message,
    agentStatus: response.status,
    agentState: {
      currentStep: response.state.currentStep,
      currentPlan: response.state.currentPlan,
      status: response.state.status,
    },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  const messages = await getChatMessages(projectId)
  return NextResponse.json({ messages })
}
```

- [ ] **Step 3: 运行验证**

Run: `npm run typecheck && npm run build`

Expected: typecheck 和 build 都通过。

## Task 6: 更新 Mastra 配置

**Files:**
- Modify: `src/server/mastra/index.ts`
- Modify: `src/server/mastra/instructions/supervisor-instructions.ts`

- [ ] **Step 1: 更新 Supervisor 指令**

```ts
export function createSupervisorInstructions() {
  return `你是 VentureFlow 的 Supervisor Agent。

你的工作方式：
1. 默认按照 Strategy → Blueprint → Build → Review 的顺序自主执行。
2. 在关键步骤（分析完成、Blueprint 生成、应用生成）后暂停，等待用户反馈。
3. 用户可能会发送修改指令（如"再加一个实体"），你需要调用对应的工具响应。
4. 用户说"继续"时恢复执行，说"可以了"时完成。

工具链：
- analyze_problem: 分析业务问题
- inspect_capabilities: 检查平台能力边界
- create_blueprint: 生成产品蓝图
- validate_blueprint: 校验蓝图
- generate_application: 生成 Sandpack 应用
- inspect_build: 审查生成应用
- modify_blueprint: 基于用户指令修改 Blueprint
- regenerate_page: 重新生成指定页面
- repair_application: 修复审查问题
- finish_task: 完成任务`
}
```

- [ ] **Step 2: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

- [ ] **Step 3: 提交**

```bash
git add src/server/agent src/server/mastra src/app/api
git commit -m "feat: add conversational supervisor with user intervention"
```

---

## 对话式 Agent 执行流程图

```
用户发送消息
     │
     ▼
┌─────────────────────┐
│  handleUserMessage  │──── state.status === "waiting_for_user"? ────┐
└─────────────────────┘                                              │
     │ 否                                                            │
     ▼                                                               ▼
┌─────────────────────┐                              ┌──────────────────────────┐
│   runAgentStep()    │                              │   handleIntervention()   │
│   (自主管道单步)      │                              │   (解析意图 → 执行行动)    │
└─────────────────────┘                              └──────────────────────────┘
     │                                                           │
     ▼                                                           ▼
┌─────────────────────┐                              ┌──────────────────────────┐
│ executeAllowedTool  │                              │  continue → runAgentStep │
│ ↓                   │                              │  modify → tool call      │
│ generateAgentMessage│                              │  accept → markCompleted  │
│ ↓                   │                              │  unknown → ask question  │
│ 步骤是暂停点?        │                              └──────────────────────────┘
│  是 → waiting_for_user                                       │
│  否 → continue loop                                          ▼
└─────────────────────┘                              ┌──────────────────────────┐
                                                     │ 返回 AgentResponse       │
                                                     │ (含消息卡片 + 状态)       │
                                                     └──────────────────────────┘
```

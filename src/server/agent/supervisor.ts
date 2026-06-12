import { agentActionSchema, agentStateSchema } from "@/server/contracts"
import type { AgentAction, AgentState, ToolCallRecord, ToolName } from "@/server/contracts"
import type { ChatMessage } from "@/server/contracts/chat-message"
import type { UserIntent } from "@/server/contracts/user-intent"
import { parseUserIntent } from "./user-intent"
import { canFinish, canFinishByUserAccept } from "./can-finish"
import { MAX_AGENT_STEPS, MAX_BUILD_ATTEMPTS, MAX_REPAIR_ATTEMPTS, STEPS_THAT_CAN_WAIT_FOR_USER } from "./constants"
import type { AgentToolRegistry, AgentToolResult } from "./tool-registry"
import { saveChatMessage } from "@/server/messages/message-repository"

type ToolAction = Extract<AgentAction, { type: "tool" }>

type SupervisorRuntime = {
  decide: (state: AgentState) => Promise<unknown>
  executeTool?: (action: ToolAction, state: AgentState) => Promise<AgentToolResult>
  toolRegistry?: AgentToolRegistry
  save: (state: AgentState) => Promise<void>
}

function nowIso() {
  return new Date().toISOString()
}

function summarizeArguments(args: ToolAction["arguments"]) {
  return JSON.stringify(args)
}

function createFailureRecord(input: {
  toolName: ToolCallRecord["toolName"]
  reasoningSummary: string
  argumentsSummary: string
  resultSummary: string
  startedAt: string
  errorMessage?: string
}): ToolCallRecord {
  return {
    toolName: input.toolName,
    reasoningSummary: input.reasoningSummary,
    argumentsSummary: input.argumentsSummary,
    resultSummary: input.resultSummary,
    status: "failed",
    startedAt: input.startedAt,
    endedAt: nowIso(),
    errorMessage: input.errorMessage,
    tokenUsage: 0,
  }
}

function getAttemptPatch(action: ToolAction, state: AgentState): Pick<AgentState, "buildAttempts" | "repairAttempts"> {
  return {
    buildAttempts: action.toolName === "generate_application" ? state.buildAttempts + 1 : state.buildAttempts,
    repairAttempts: action.toolName === "repair_application" ? state.repairAttempts + 1 : state.repairAttempts,
  }
}

function getBudgetError(action: ToolAction, state: AgentState) {
  if (action.toolName === "generate_application" && state.buildAttempts >= MAX_BUILD_ATTEMPTS) {
    return "应用生成次数已达到上限"
  }

  if (action.toolName === "repair_application" && state.repairAttempts >= MAX_REPAIR_ATTEMPTS) {
    return "应用修复次数已达到上限"
  }

  return null
}

async function executeRuntimeTool(action: ToolAction, state: AgentState, runtime: SupervisorRuntime) {
  if (runtime.toolRegistry) {
    const tool = runtime.toolRegistry.get(action.toolName)
    return tool.execute(action.arguments, state)
  }

  if (runtime.executeTool) {
    return runtime.executeTool(action, state)
  }

  throw new Error(`Tool is not registered: ${action.toolName}`)
}

export async function runSupervisorWithDecisionProvider(initialState: AgentState, runtime: SupervisorRuntime) {
  let state: AgentState = { ...initialState, status: "executing" }

  for (let step = 0; step < MAX_AGENT_STEPS; step += 1) {
    const decisionResult = agentActionSchema.safeParse(await runtime.decide(state))

    if (!decisionResult.success) {
      const timestamp = nowIso()
      state = {
        ...state,
        status: "failed",
        currentStep: step + 1,
        toolCalls: [
          ...state.toolCalls,
          createFailureRecord({
            toolName: "finish_task",
            reasoningSummary: "Supervisor decision validation failed",
            argumentsSummary: "{}",
            resultSummary: "决策输出未通过 Schema 校验",
            startedAt: timestamp,
            errorMessage: decisionResult.error.message,
          }),
        ],
      }
      await runtime.save(state)
      return state
    }

    const decision = decisionResult.data

    if (decision.type === "finish") {
      const timestamp = nowIso()

      if (canFinish(state)) {
        state = { ...state, status: "completed" }
        await runtime.save(state)
        return state
      }

      state = {
        ...state,
        currentStep: step + 1,
        toolCalls: [
          ...state.toolCalls,
          createFailureRecord({
            toolName: "finish_task",
            reasoningSummary: decision.reasoningSummary,
            argumentsSummary: "{}",
            resultSummary: "完成条件未通过",
            startedAt: timestamp,
          }),
        ],
      }
      await runtime.save(state)
      continue
    }

    const startedAt = nowIso()
    const budgetError = getBudgetError(decision, state)

    if (budgetError) {
      state = {
        ...state,
        status: "failed",
        currentStep: step + 1,
        toolCalls: [
          ...state.toolCalls,
          createFailureRecord({
            toolName: decision.toolName,
            reasoningSummary: decision.reasoningSummary,
            argumentsSummary: summarizeArguments(decision.arguments),
            resultSummary: "工具调用预算已耗尽",
            startedAt,
            errorMessage: budgetError,
          }),
        ],
      }
      await runtime.save(state)
      return state
    }

    try {
      const result = await executeRuntimeTool(decision, state, runtime)
      const endedAt = nowIso()
      const record: ToolCallRecord = {
        toolName: decision.toolName,
        reasoningSummary: decision.reasoningSummary,
        argumentsSummary: summarizeArguments(decision.arguments),
        resultSummary: result.summary,
        status: "completed",
        startedAt,
        endedAt,
        tokenUsage: 0,
      }

      const nextState = {
        ...state,
        ...result.statePatch,
        ...getAttemptPatch(decision, state),
        currentStep: step + 1,
        toolCalls: [...state.toolCalls, record],
      }

      state = agentStateSchema.parse(nextState)
      await runtime.save(state)
    } catch (error) {
      const endedAt = nowIso()
      const record: ToolCallRecord = {
        toolName: decision.toolName,
        reasoningSummary: decision.reasoningSummary,
        argumentsSummary: summarizeArguments(decision.arguments),
        resultSummary: "工具执行失败",
        status: "failed",
        startedAt,
        endedAt,
        errorMessage: error instanceof Error ? error.message : "Unknown tool error",
        tokenUsage: 0,
      }

      state = {
        ...state,
        status: "failed",
        currentStep: step + 1,
        toolCalls: [...state.toolCalls, record],
      }
      await runtime.save(state)
      return state
    }
  }

  state = { ...state, status: canFinish(state) ? "completed" : "failed" }
  await runtime.save(state)
  return state
}

/**
 * Agent 响应类型
 * 包含更新的状态、用户可见的消息卡片和执行状态
 */
export type AgentResponse = {
  state: AgentState
  message: Pick<ChatMessage, "role" | "type" | "content"> & { metadata?: Record<string, unknown> | null }
  status: "executing" | "waiting_for_user" | "completed" | "failed"
}

/**
 * 对话式 Supervisor 主入口
 * 接收用户消息，返回 Agent 响应（含消息卡片和执行状态）
 */
export async function handleUserMessage(
  projectId: string,
  userMessage: string,
  stateLoader: (projectId: string) => Promise<AgentState>,
  stateSaver: (state: AgentState) => Promise<void>,
  decideFn: (state: AgentState) => Promise<unknown>,
  toolRegistry: AgentToolRegistry,
): Promise<AgentResponse> {
  const state = await stateLoader(projectId)

  // 记录用户消息
  await saveChatMessage({
    projectId,
    role: "user",
    type: "user-text",
    content: userMessage,
  })

  // 如果 Agent 正在等待用户反馈，处理干预
  if (state.status === "waiting_for_user") {
    return handleIntervention(state, userMessage, stateSaver, decideFn, toolRegistry)
  }

  // 否则启动/继续自主管道
  return runAgentStep(state, stateSaver, decideFn, toolRegistry)
}

/**
 * 处理用户干预指令
 * 当 Agent 处于 waiting_for_user 状态时，解析用户意图并执行对应行动
 */
async function handleIntervention(
  state: AgentState,
  userMessage: string,
  stateSaver: (state: AgentState) => Promise<void>,
  decideFn: (state: AgentState) => Promise<unknown>,
  toolRegistry: AgentToolRegistry,
): Promise<AgentResponse> {
  const intent = await parseUserIntent(userMessage, { status: state.status })

  switch (intent.type) {
    case "continue":
      state = { ...state, status: "executing", waitingForStep: undefined }
      return runAgentStep(state, stateSaver, decideFn, toolRegistry)

    case "modify_blueprint":
      return executeInterventionTool(state, {
        toolName: "modify_blueprint",
        arguments: {
          blueprint: state.blueprint,
          instruction: intent.instruction,
        },
      }, stateSaver, toolRegistry)

    case "redo_blueprint":
      return executeInterventionTool(state, {
        toolName: "create_blueprint",
        arguments: {
          originalProblem: state.originalProblem,
          strategy: state.strategy,
        },
      }, stateSaver, toolRegistry)

    case "regenerate_page":
      return executeInterventionTool(state, {
        toolName: "regenerate_page",
        arguments: {
          blueprint: state.blueprint,
          build: state.build,
          targetPage: intent.targetPage,
          instruction: intent.instruction,
        },
      }, stateSaver, toolRegistry)

    case "skip_to_build": {
      // 快速前进到生成应用步骤
      const plan = state.currentPlan.map((item) => {
        if (item.title === "生成可运行应用") return { ...item, status: "running" as const }
        return { ...item, status: "completed" as const }
      })
      state = { ...state, status: "executing", currentPlan: plan, waitingForStep: undefined }
      return runAgentStep(state, stateSaver, decideFn, toolRegistry)
    }

    case "accept":
      if (canFinishByUserAccept(state)) {
        state = { ...state, status: "completed" }
        await stateSaver(state)
        return {
          state,
          message: { role: "agent", type: "system-info", content: "好的，项目已完成。" },
          status: "completed",
        }
      }
      return {
        state,
        message: { role: "agent", type: "agent-question", content: "应用还没有生成，需要先生成应用才能完成。要继续吗？" },
        status: "waiting_for_user",
      }

    default:
      return {
        state,
        message: {
          role: "agent",
          type: "agent-question",
          content: "我不太确定你的意思。你可以试试说「继续」、「修改 Blueprint」、「直接生成应用」或者「就这样吧」。",
        },
        status: "waiting_for_user",
      }
  }
}

/**
 * 自主管道单步执行
 */
async function runAgentStep(
  state: AgentState,
  stateSaver: (state: AgentState) => Promise<void>,
  decideFn: (state: AgentState) => Promise<unknown>,
  toolRegistry: AgentToolRegistry,
): Promise<AgentResponse> {
  if (state.currentStep >= MAX_AGENT_STEPS) {
    const isComplete = canFinish(state)
    state = { ...state, status: isComplete ? "completed" : "failed" }
    await stateSaver(state)
    return {
      state,
      message: { role: "system", type: "system-info", content: isComplete ? "任务完成。" : "已达到最大执行步数。" },
      status: isComplete ? "completed" : "failed",
    }
  }

  const decisionResult = agentActionSchema.safeParse(await decideFn(state))

  if (!decisionResult.success) {
    state = { ...state, status: "failed" }
    await stateSaver(state)
    return {
      state,
      message: { role: "agent", type: "agent-error", content: "Agent 决策解析失败。" },
      status: "failed",
    }
  }

  const decision = decisionResult.data

  if (decision.type === "finish") {
    if (canFinish(state)) {
      state = { ...state, status: "completed" }
      await stateSaver(state)
      return {
        state,
        message: { role: "agent", type: "system-info", content: "所有步骤已完成，项目已就绪。" },
        status: "completed",
      }
    }
    // 管道未完成，进入等待
    state = { ...state, status: "waiting_for_user" }
    await stateSaver(state)
    return {
      state,
      message: { role: "agent", type: "agent-question", content: "已完成部分分析。要继续吗？" },
      status: "waiting_for_user",
    }
  }

  // 预算检查
  const budgetError = getBudgetError(decision, state)
  if (budgetError) {
    state = { ...state, status: "failed" }
    await stateSaver(state)
    return {
      state,
      message: { role: "agent", type: "agent-error", content: budgetError },
      status: "failed",
    }
  }

  // 执行工具
  try {
    const tool = toolRegistry.get(decision.toolName)
    const result = await tool.execute(decision.arguments, state)

    state = {
      ...state,
      ...result.statePatch,
      ...getAttemptPatch(decision, state),
      currentStep: state.currentStep + 1,
    }

    // 生成消息卡片
    const message = buildAgentMessage(decision.toolName, state)

    // 判断是否需要暂停等待用户
    if (STEPS_THAT_CAN_WAIT_FOR_USER.includes(decision.toolName)) {
      state = { ...state, status: "waiting_for_user", waitingForStep: decision.toolName }
      await stateSaver(state)
      return { state, message, status: "waiting_for_user" }
    }

    await stateSaver(state)
    return { state, message, status: "executing" }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "工具执行失败"
    return {
      state: { ...state, status: "failed" },
      message: { role: "agent", type: "agent-error", content: `执行 ${decision.toolName} 失败: ${errMsg}` },
      status: "failed",
    }
  }
}

/**
 * 执行用户干预触发的工具调用
 */
async function executeInterventionTool(
  state: AgentState,
  action: { toolName: string; arguments: Record<string, unknown> },
  stateSaver: (state: AgentState) => Promise<void>,
  toolRegistry: AgentToolRegistry,
): Promise<AgentResponse> {
  try {
    const tool = toolRegistry.get(action.toolName as ToolName)
    const result = await tool.execute(action.arguments as never, state)

    state = { ...state, ...result.statePatch }
    const message = buildAgentMessage(action.toolName, state)

    state = { ...state, status: "waiting_for_user", waitingForStep: action.toolName }
    await stateSaver(state)
    return { state, message, status: "waiting_for_user" }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "工具执行失败"
    return {
      state,
      message: { role: "agent", type: "agent-error", content: `执行失败: ${errMsg}` },
      status: "waiting_for_user",
    }
  }
}

/**
 * 根据工具名和当前 AgentState 生成用户可见的消息卡片
 */
function buildAgentMessage(
  toolName: string,
  state: AgentState,
): Pick<ChatMessage, "role" | "type" | "content"> & { metadata?: Record<string, unknown> | null } {
  switch (toolName) {
    case "analyze_problem":
      return {
        role: "agent",
        type: "agent-strategy",
        content: `## 业务分析完成\n\n**问题：**${state.strategy?.problemSummary ?? ""}\n**推荐方案：**${state.strategy?.recommendedAppPattern ?? ""}`,
        metadata: { strategy: state.strategy, agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      }

    case "create_blueprint":
    case "modify_blueprint": {
      const entityList = state.blueprint?.entities?.map((e: { label: string }) => e.label).join("、") ?? ""
      const entityCount = state.blueprint?.entities?.length ?? 0
      const pageCount = state.blueprint?.pages?.length ?? 0
      return {
        role: "agent",
        type: "agent-blueprint",
        content: `## Product Blueprint\n\n**实体：**${entityList}（${entityCount}/4个）\n**页面：**${pageCount}/5个\n**类型：**${state.blueprint?.appPattern ?? ""}`,
        metadata: { blueprint: state.blueprint, agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      }
    }

    case "generate_application":
    case "regenerate_page":
      return {
        role: "agent",
        type: "agent-build",
        content: `## 应用已生成\n\n已生成 ${state.build?.files?.length ?? 0} 个文件，可在右侧面板预览。`,
        metadata: { build: state.build, agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      }

    case "inspect_build":
      if (state.review?.passed) {
        return {
          role: "agent",
          type: "agent-review",
          content: "## ✅ 审查通过\n\n应用满足所有安全边界和功能要求。",
          metadata: { review: state.review, agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
        }
      }
      return {
        role: "agent",
        type: "agent-review",
        content: `## ⚠️ 审查发现问题\n\n${state.review?.issues?.map((i: { message: string }) => `- ${i.message}`).join("\n") ?? ""}`,
        metadata: { review: state.review, agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      }

    case "repair_application":
      return {
        role: "agent",
        type: "agent-build",
        content: "## 应用已修复\n\n已根据审查结果修复问题。",
        metadata: { build: state.build, agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      }

    case "optimize_product":
      return {
        role: "agent",
        type: "system-info",
        content: `## 优化建议\n\n已生成 ${state.optimization?.recommendations?.length ?? 0} 条优化建议。`,
        metadata: { optimization: state.optimization, agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      }

    default:
      return {
        role: "agent",
        type: "system-info",
        content: `执行完成：${toolName}`,
        metadata: { agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      }
  }
}

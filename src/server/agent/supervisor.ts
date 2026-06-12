import { agentActionSchema, agentStateSchema } from "@/server/contracts"
import type { AgentAction, AgentState, ToolCallRecord, ToolName } from "@/server/contracts"
import type { ChatMessage } from "@/server/contracts/chat-message"
import type { UserIntent } from "@/server/contracts/user-intent"
import { parseUserIntent } from "./user-intent"
import { canFinish, canFinishByUserAccept } from "./can-finish"
import { MAX_AGENT_STEPS, MAX_BUILD_ATTEMPTS, MAX_REPAIR_ATTEMPTS } from "./constants"
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
  messages: Array<Pick<ChatMessage, "role" | "type" | "content"> & { metadata?: Record<string, unknown> | null }>
  status: "executing" | "waiting_for_user" | "completed" | "failed"
}

type AgentVisibleMessage = AgentResponse["messages"][number]

const pipelineToolNames: ToolName[] = [
  "analyze_problem",
  "inspect_capabilities",
  "create_blueprint",
  "validate_blueprint",
  "generate_application",
  "inspect_build",
]

function hasCompletedTool(state: AgentState, toolName: ToolName) {
  return state.toolCalls.some((call) => call.toolName === toolName && call.status === "completed")
}

function createPipelineAction(state: AgentState): ToolAction | null {
  if (!state.strategy) {
    return {
      type: "tool",
      toolName: "analyze_problem",
      reasoningSummary: "先把业务问题转成结构化 Strategy，明确用户、痛点、目标和成功指标。",
      arguments: { problem: state.originalProblem },
    }
  }

  if (!state.capabilities) {
    return {
      type: "tool",
      toolName: "inspect_capabilities",
      reasoningSummary: "确认 VentureFlow 当前能力边界，避免生成超出 MVP 范围的方案。",
      arguments: {},
    }
  }

  if (!state.blueprint) {
    return {
      type: "tool",
      toolName: "create_blueprint",
      reasoningSummary: "基于 Strategy 生成可落地的 Product Blueprint，作为应用生成的前置契约。",
      arguments: { originalProblem: state.originalProblem, strategy: state.strategy },
    }
  }

  if (!hasCompletedTool(state, "validate_blueprint")) {
    return {
      type: "tool",
      toolName: "validate_blueprint",
      reasoningSummary: "校验 Blueprint 是否落在页面、实体和核心功能的能力边界内。",
      arguments: {
        pagesCount: state.blueprint.pages.length,
        entitiesCount: state.blueprint.entities.length,
        coreFeaturesCount: state.blueprint.workflows.length,
      },
    }
  }

  if (!state.build) {
    return {
      type: "tool",
      toolName: "generate_application",
      reasoningSummary: "Blueprint 已就绪，开始生成可在 Sandpack 中运行的 React 应用。",
      arguments: { blueprint: state.blueprint },
    }
  }

  if (!state.review) {
    return {
      type: "tool",
      toolName: "inspect_build",
      reasoningSummary: "检查生成应用的入口文件、安全边界和基础功能完整性。",
      arguments: { build: state.build },
    }
  }

  if (!state.review.passed && state.repairAttempts < MAX_REPAIR_ATTEMPTS) {
    return {
      type: "tool",
      toolName: "repair_application",
      reasoningSummary: "Review 发现问题，使用剩余修复预算进行一次受控修复。",
      arguments: { blueprint: state.blueprint, build: state.build, review: state.review },
    }
  }

  return null
}

function updatePlanForTool(state: AgentState, toolName: ToolName, status: "running" | "completed" | "failed") {
  const stepIndex = pipelineToolNames.indexOf(toolName)
  if (stepIndex === -1) return state.currentPlan

  return state.currentPlan.map((item, index) => {
    if (index < stepIndex) return { ...item, status: "completed" as const }
    if (index === stepIndex) return { ...item, status }
    return item
  })
}

function createThinkingMessage(action: ToolAction, state: AgentState): AgentVisibleMessage {
  return {
    role: "agent",
    type: "agent-thinking",
    content: `正在执行：${action.toolName}\n\n${action.reasoningSummary}`,
    metadata: {
      toolName: action.toolName,
      reasoningSummary: action.reasoningSummary,
      agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan },
    },
  }
}

function createResponse(input: {
  state: AgentState
  messages: AgentVisibleMessage[]
  status: AgentResponse["status"]
}): AgentResponse {
  const message = input.messages.at(-1) ?? {
    role: "agent" as const,
    type: "system-info",
    content: "Agent 没有产生新的消息。",
  }

  return {
    state: input.state,
    message,
    messages: input.messages.length > 0 ? input.messages : [message],
    status: input.status,
  }
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
  return runAgentTurn(state, stateSaver, toolRegistry)
}

// ──── Streaming Events ────────────────────────────────────────────────

export type StreamEvent =
  | { type: "thinking"; step: number; toolName: string; message: string; plan: AgentState["currentPlan"] }
  | { type: "state"; step: number; status: AgentState["status"]; plan: AgentState["currentPlan"] }
  | { type: "result"; message: AgentVisibleMessage; plan: AgentState["currentPlan"] }
  | { type: "done"; status: AgentResponse["status"]; finalMessage?: AgentVisibleMessage }
  | { type: "error"; message: string }

export type StreamEmitter = (event: StreamEvent) => void

/**
 * 流式版 Supervisor — 每一步实时推送 thinking / state / result 事件
 */
export async function handleUserMessageStream(
  projectId: string,
  userMessage: string,
  stateLoader: (projectId: string) => Promise<AgentState>,
  stateSaver: (state: AgentState) => Promise<void>,
  toolRegistry: AgentToolRegistry,
  emit: StreamEmitter,
): Promise<void> {
  const state = await stateLoader(projectId)

  await saveChatMessage({
    projectId,
    role: "user",
    type: "user-text",
    content: userMessage,
  })

  if (state.status === "waiting_for_user") {
    // Streaming 模式下暂不支持干预路径（退回旧逻辑）
    const response = await handleIntervention(
      state, userMessage, stateSaver,
      async () => ({ type: "finish", reasoningSummary: "streaming fallback" }),
      toolRegistry,
    )
    emit({ type: "result", message: response.message, plan: response.state.currentPlan })
    emit({ type: "done", status: response.status })
    return
  }

  await runAgentTurnStream(state, stateSaver, toolRegistry, emit)
}

async function runAgentTurnStream(
  initialState: AgentState,
  stateSaver: (state: AgentState) => Promise<void>,
  toolRegistry: AgentToolRegistry,
  emit: StreamEmitter,
) {
  let state: AgentState = { ...initialState, status: "executing", waitingForStep: undefined }

  for (let step = 0; step < MAX_AGENT_STEPS; step += 1) {
    const action = createPipelineAction(state)

    if (!action) {
      const isComplete = canFinish(state)
      state = { ...state, status: isComplete ? "completed" : "waiting_for_user" }
      await stateSaver(state)

      emit({
        type: "state",
        step,
        status: state.status,
        plan: state.currentPlan,
      })

      if (isComplete) {
        const msg: AgentVisibleMessage = {
          role: "agent", type: "system-info",
          content: "所有步骤已完成，项目已就绪。",
          metadata: { agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
        }
        emit({ type: "result", message: msg, plan: state.currentPlan })
        emit({ type: "done", status: "completed", finalMessage: msg })
        return
      }

      const questionMsg: AgentVisibleMessage = {
        role: "agent", type: "agent-question",
        content: "已完成当前可执行步骤，但完成条件还未通过。你可以继续补充需求或让我重试。",
        metadata: { agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      }
      emit({ type: "result", message: questionMsg, plan: state.currentPlan })
      emit({ type: "done", status: "waiting_for_user", finalMessage: questionMsg })
      return
    }

    const budgetError = getBudgetError(action, state)
    if (budgetError) {
      state = { ...state, status: "failed", currentPlan: updatePlanForTool(state, action.toolName, "failed") }
      await stateSaver(state)
      emit({ type: "error", message: budgetError })
      emit({ type: "done", status: "failed" })
      return
    }

    // ── Step start: push thinking event ──
    state = { ...state, currentPlan: updatePlanForTool(state, action.toolName, "running") }
    emit({
      type: "thinking",
      step,
      toolName: action.toolName,
      message: action.reasoningSummary,
      plan: state.currentPlan,
    })

    try {
      const tool = toolRegistry.get(action.toolName)
      const result = await tool.execute(action.arguments, state)

      const record: ToolCallRecord = {
        toolName: action.toolName,
        reasoningSummary: action.reasoningSummary,
        argumentsSummary: summarizeArguments(action.arguments),
        resultSummary: result.summary,
        status: "completed",
        startedAt: nowIso(),
        endedAt: nowIso(),
        tokenUsage: 0,
      }

      const nextState = {
        ...state,
        ...result.statePatch,
        ...(action.toolName === "repair_application" ? { review: undefined } : {}),
        ...getAttemptPatch(action, state),
        currentStep: state.currentStep + 1,
        currentPlan: updatePlanForTool(state, action.toolName, "completed"),
        toolCalls: [...state.toolCalls, record],
      }

      state = agentStateSchema.parse(nextState)
      await stateSaver(state)

      // ── Step complete: push result event ──
      const resultMsg = buildAgentMessage(action.toolName, state)
      emit({
        type: "result",
        message: { ...resultMsg, metadata: { ...resultMsg.metadata, agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } } },
        plan: state.currentPlan,
      })

      emit({
        type: "state",
        step,
        status: state.status,
        plan: state.currentPlan,
      })
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "工具执行失败"
      state = {
        ...state,
        status: "failed",
        currentPlan: updatePlanForTool(state, action.toolName, "failed"),
      }
      await stateSaver(state)
      emit({ type: "error", message: `执行 ${action.toolName} 失败: ${errMsg}` })
      emit({ type: "done", status: "failed" })
      return
    }
  }

  state = { ...state, status: canFinish(state) ? "completed" : "failed" }
  await stateSaver(state)
  const finalMsg: AgentVisibleMessage = {
    role: "agent",
    type: state.status === "completed" ? "system-info" : "agent-error",
    content: state.status === "completed" ? "任务完成。" : "已达到最大执行步数，仍未完成任务。",
    metadata: { agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
  }
  emit({ type: "result", message: finalMsg, plan: state.currentPlan })
  emit({ type: "done", status: state.status === "completed" ? "completed" : "failed", finalMessage: finalMsg })
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
      return runAgentTurn(state, stateSaver, toolRegistry)

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
      // 用户希望加速时仍然必须补齐 Strategy/Blueprint 等前置契约。
      state = { ...state, status: "executing", waitingForStep: undefined }
      return runAgentTurn(state, stateSaver, toolRegistry)
    }

    case "accept":
      if (canFinishByUserAccept(state)) {
        state = { ...state, status: "completed" }
        await stateSaver(state)
        return {
          state,
          messages: [{ role: "agent", type: "system-info", content: "好的，项目已完成。" }],
          message: { role: "agent", type: "system-info", content: "好的，项目已完成。" },
          status: "completed",
        }
      }
      return runAgentTurn({ ...state, status: "executing", waitingForStep: undefined }, stateSaver, toolRegistry)

    default:
      return {
        state,
        messages: [{
          role: "agent",
          type: "agent-question",
          content: "我不太确定你的意思。你可以试试说「继续」、「修改 Blueprint」、「直接生成应用」或者「就这样吧」。",
        }],
        message: {
          role: "agent",
          type: "agent-question",
          content: "我不太确定你的意思。你可以试试说「继续」、「修改 Blueprint」、「直接生成应用」或者「就这样吧」。",
        },
        status: "waiting_for_user",
      }
  }
}

async function runAgentTurn(
  initialState: AgentState,
  stateSaver: (state: AgentState) => Promise<void>,
  toolRegistry: AgentToolRegistry,
): Promise<AgentResponse> {
  let state: AgentState = { ...initialState, status: "executing", waitingForStep: undefined }
  const messages: AgentVisibleMessage[] = []

  for (let step = 0; step < MAX_AGENT_STEPS; step += 1) {
    const action = createPipelineAction(state)

    if (!action) {
      const isComplete = canFinish(state)
      state = { ...state, status: isComplete ? "completed" : "waiting_for_user" }
      await stateSaver(state)

      if (isComplete) {
        messages.push({
          role: "agent",
          type: "system-info",
          content: "所有步骤已完成，项目已就绪。",
          metadata: { agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
        })
        return createResponse({ state, messages, status: "completed" })
      }

      messages.push({
        role: "agent",
        type: "agent-question",
        content: "已完成当前可执行步骤，但完成条件还未通过。你可以继续补充需求或让我重试。",
        metadata: { agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      })
      return createResponse({ state, messages, status: "waiting_for_user" })
    }

    const budgetError = getBudgetError(action, state)
    if (budgetError) {
      state = { ...state, status: "failed", currentPlan: updatePlanForTool(state, action.toolName, "failed") }
      await stateSaver(state)
      messages.push({
        role: "agent",
        type: "agent-error",
        content: budgetError,
        metadata: { agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      })
      return createResponse({ state, messages, status: "failed" })
    }

    state = { ...state, currentPlan: updatePlanForTool(state, action.toolName, "running") }
    messages.push(createThinkingMessage(action, state))

    try {
      const tool = toolRegistry.get(action.toolName)
      const result = await tool.execute(action.arguments, state)
      const record: ToolCallRecord = {
        toolName: action.toolName,
        reasoningSummary: action.reasoningSummary,
        argumentsSummary: summarizeArguments(action.arguments),
        resultSummary: result.summary,
        status: "completed",
        startedAt: nowIso(),
        endedAt: nowIso(),
        tokenUsage: 0,
      }

      const nextState = {
        ...state,
        ...result.statePatch,
        ...(action.toolName === "repair_application" ? { review: undefined } : {}),
        ...getAttemptPatch(action, state),
        currentStep: state.currentStep + 1,
        currentPlan: updatePlanForTool(state, action.toolName, "completed"),
        toolCalls: [...state.toolCalls, record],
      }

      state = agentStateSchema.parse(nextState)
      await stateSaver(state)
      messages.push(buildAgentMessage(action.toolName, state))
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "工具执行失败"
      state = {
        ...state,
        status: "failed",
        currentPlan: updatePlanForTool(state, action.toolName, "failed"),
      }
      await stateSaver(state)
      messages.push({
        role: "agent",
        type: "agent-error",
        content: `执行 ${action.toolName} 失败: ${errMsg}`,
        metadata: { agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
      })
      return createResponse({ state, messages, status: "failed" })
    }
  }

  state = { ...state, status: canFinish(state) ? "completed" : "failed" }
  await stateSaver(state)
  messages.push({
    role: "agent",
    type: state.status === "completed" ? "system-info" : "agent-error",
    content: state.status === "completed" ? "任务完成。" : "已达到最大执行步数，仍未完成任务。",
    metadata: { agentState: { currentStep: state.currentStep, currentPlan: state.currentPlan } },
  })
  return createResponse({ state, messages, status: state.status === "completed" ? "completed" : "failed" })
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
    return { state, message, messages: [message], status: "waiting_for_user" }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "工具执行失败"
    const message: AgentVisibleMessage = { role: "agent", type: "agent-error", content: `执行失败: ${errMsg}` }
    return {
      state,
      message,
      messages: [message],
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

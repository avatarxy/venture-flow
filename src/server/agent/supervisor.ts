import { agentActionSchema, agentStateSchema } from "@/server/contracts"
import type { AgentAction, AgentState, ToolCallRecord } from "@/server/contracts"
import { canFinish } from "./can-finish"
import { MAX_AGENT_STEPS, MAX_BUILD_ATTEMPTS, MAX_REPAIR_ATTEMPTS } from "./constants"
import type { AgentToolRegistry, AgentToolResult } from "./tool-registry"

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

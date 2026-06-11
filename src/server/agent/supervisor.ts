import type { AgentAction, AgentState, ToolCallRecord } from "@/server/contracts"
import { canFinish } from "./can-finish"
import { MAX_AGENT_STEPS } from "./constants"

type ToolAction = Extract<AgentAction, { type: "tool" }>

type SupervisorRuntime = {
  decide: (state: AgentState) => Promise<AgentAction>
  executeTool: (action: ToolAction, state: AgentState) => Promise<Partial<AgentState>>
  save: (state: AgentState) => Promise<void>
}

function nowIso() {
  return new Date().toISOString()
}

function summarizeArguments(args: ToolAction["arguments"]) {
  return JSON.stringify(args)
}

export async function runSupervisorWithDecisionProvider(initialState: AgentState, runtime: SupervisorRuntime) {
  let state: AgentState = { ...initialState, status: "executing" }

  for (let step = 0; step < MAX_AGENT_STEPS; step += 1) {
    const decision = await runtime.decide(state)

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
          {
            toolName: "finish_task",
            reasoningSummary: decision.reasoningSummary,
            argumentsSummary: "{}",
            resultSummary: "完成条件未通过",
            status: "failed",
            startedAt: timestamp,
            endedAt: timestamp,
            tokenUsage: 0,
          },
        ],
      }
      await runtime.save(state)
      continue
    }

    const startedAt = nowIso()

    try {
      const patch = await runtime.executeTool(decision, state)
      const endedAt = nowIso()
      const record: ToolCallRecord = {
        toolName: decision.toolName,
        reasoningSummary: decision.reasoningSummary,
        argumentsSummary: summarizeArguments(decision.arguments),
        resultSummary: "工具执行完成",
        status: "completed",
        startedAt,
        endedAt,
        tokenUsage: 0,
      }

      state = {
        ...state,
        ...patch,
        currentStep: step + 1,
        toolCalls: [...state.toolCalls, record],
      }
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

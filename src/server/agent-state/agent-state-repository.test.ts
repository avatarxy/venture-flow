import { describe, expect, it } from "vitest"
import { validateAgentStateForPersistence } from "./agent-state-repository"
import { passingReview, validBlueprint, validStrategy } from "@/server/agent/agent-fixtures"

const validAgentState = {
  projectId: "project_1",
  originalProblem: "销售线索很多，但团队经常忘记跟进",
  goal: "将业务问题转化为可运行、可分析、可迭代的业务应用",
  status: "executing",
  currentPlan: [{ title: "Analyze problem", status: "completed" }],
  currentStep: 1,
  strategy: validStrategy,
  blueprint: validBlueprint,
  build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
  review: passingReview,
  toolCalls: [
    {
      toolName: "analyze_problem",
      reasoningSummary: "Identify problem shape",
      argumentsSummary: "problem length: 42",
      status: "completed",
      startedAt: "2026-06-11T12:00:00.000Z",
      endedAt: "2026-06-11T12:00:01.000Z",
      tokenUsage: 120,
    },
  ],
  buildAttempts: 0,
  repairAttempts: 0,
  totalTokens: 120,
}

describe("validateAgentStateForPersistence", () => {
  it("accepts bounded persisted agent state", () => {
    expect(validateAgentStateForPersistence(validAgentState)).toEqual(validAgentState)
  })

  it("rejects unsupported agent status values", () => {
    expect(() => validateAgentStateForPersistence({ ...validAgentState, status: "done" })).toThrow()
  })

  it("accepts user-stopped agent state", () => {
    expect(validateAgentStateForPersistence({ ...validAgentState, status: "stopped" }).status).toBe("stopped")
  })

  it("rejects negative counters", () => {
    expect(() => validateAgentStateForPersistence({ ...validAgentState, buildAttempts: -1 })).toThrow()
  })

  it("rejects unstructured tool calls", () => {
    expect(() => validateAgentStateForPersistence({ ...validAgentState, toolCalls: [{ status: "completed" }] })).toThrow()
  })

  it("rejects states that cannot restore agent context", () => {
    const stateWithoutProblem: Partial<typeof validAgentState> = { ...validAgentState }
    delete stateWithoutProblem.originalProblem

    expect(() => validateAgentStateForPersistence(stateWithoutProblem)).toThrow()
  })
})

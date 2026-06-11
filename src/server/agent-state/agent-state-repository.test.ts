import { describe, expect, it } from "vitest"
import { validateAgentStateForPersistence } from "./agent-state-repository"

const validAgentState = {
  projectId: "project_1",
  status: "executing",
  currentPlan: [{ title: "Analyze problem", status: "completed" }],
  currentStep: 1,
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

  it("rejects negative counters", () => {
    expect(() => validateAgentStateForPersistence({ ...validAgentState, buildAttempts: -1 })).toThrow()
  })

  it("rejects unstructured tool calls", () => {
    expect(() => validateAgentStateForPersistence({ ...validAgentState, toolCalls: [{ status: "completed" }] })).toThrow()
  })
})

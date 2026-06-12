import { describe, expect, it } from "vitest"
import { agentStateSchema } from "@/server/contracts"
import { validateAgentStateForPersistence } from "@/server/agent-state/agent-state-repository"
import { createInitialAgentState } from "./state-factory"

describe("createInitialAgentState", () => {
  it("creates planning state with default plan", () => {
    const state = createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进")

    expect(state.status).toBe("planning")
    expect(state.currentPlan).toHaveLength(6)
    expect(state.buildAttempts).toBe(0)
    expect(state.repairAttempts).toBe(0)
    expect(agentStateSchema.safeParse(state).success).toBe(true)
    expect(validateAgentStateForPersistence(state).projectId).toBe("project_1")
  })
})

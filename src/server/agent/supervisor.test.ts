import { describe, expect, it } from "vitest"
import { createInitialAgentState } from "./state-factory"
import { runSupervisorWithDecisionProvider } from "./supervisor"
import { passingReview, validBlueprint, validStrategy } from "./agent-fixtures"

describe("supervisor", () => {
  it("stops when finish is requested and canFinish passes", async () => {
    const initial = {
      ...createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"),
      strategy: validStrategy,
      blueprint: validBlueprint,
      build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
      review: passingReview,
    }

    const savedStatuses: string[] = []
    const result = await runSupervisorWithDecisionProvider(initial, {
      decide: async () => ({ type: "finish", reasoningSummary: "产物已齐全" }),
      executeTool: async () => {
        throw new Error("finish should not execute tools")
      },
      save: async (state) => {
        savedStatuses.push(state.status)
      },
    })

    expect(result.status).toBe("completed")
    expect(savedStatuses).toEqual(["completed"])
  })

  it("records tool execution and applies returned state patch", async () => {
    const initial = createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进")
    let decisionCount = 0

    const result = await runSupervisorWithDecisionProvider(initial, {
      decide: async () => {
        decisionCount += 1
        if (decisionCount === 1) {
          return {
            type: "tool",
            reasoningSummary: "需要先分析问题",
            toolName: "analyze_problem",
            arguments: { problem: initial.originalProblem },
          }
        }

        return { type: "finish", reasoningSummary: "产物已齐全" }
      },
      executeTool: async () => ({
        strategy: validStrategy,
        blueprint: validBlueprint,
        build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
        review: passingReview,
        totalTokens: 42,
      }),
      save: async () => undefined,
    })

    expect(result.status).toBe("completed")
    expect(result.currentStep).toBe(1)
    expect(result.totalTokens).toBe(42)
    expect(result.toolCalls).toMatchObject([{ toolName: "analyze_problem", status: "completed", resultSummary: "工具执行完成" }])
  })

  it("fails when the step budget is exhausted", async () => {
    const result = await runSupervisorWithDecisionProvider(createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"), {
      decide: async () => ({ type: "finish", reasoningSummary: "尝试完成" }),
      executeTool: async () => {
        throw new Error("no tools expected")
      },
      save: async () => undefined,
    })

    expect(result.status).toBe("failed")
    expect(result.currentStep).toBe(12)
    expect(result.toolCalls).toHaveLength(12)
    expect(result.toolCalls[0]?.toolName).toBe("finish_task")
  })
})

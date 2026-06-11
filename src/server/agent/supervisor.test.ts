import { describe, expect, it } from "vitest"
import { createInitialAgentState } from "./state-factory"
import { runSupervisorWithDecisionProvider } from "./supervisor"
import { createToolRegistry } from "./tool-registry"
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
      toolRegistry: createToolRegistry([
        {
          name: "analyze_problem",
          execute: async () => ({
            summary: "分析完成",
            statePatch: {
              strategy: validStrategy,
              blueprint: validBlueprint,
              build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
              review: passingReview,
              totalTokens: 42,
            },
          }),
        },
      ]),
      save: async () => undefined,
    })

    expect(result.status).toBe("completed")
    expect(result.currentStep).toBe(1)
    expect(result.totalTokens).toBe(42)
    expect(result.toolCalls).toMatchObject([{ toolName: "analyze_problem", status: "completed", resultSummary: "分析完成" }])
  })

  it("rejects invalid decisions before executing tools", async () => {
    let executeCount = 0
    const result = await runSupervisorWithDecisionProvider(createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"), {
      decide: async () => ({ type: "tool", reasoningSummary: "坏决策", toolName: "unknown_tool", arguments: {} }),
      executeTool: async () => {
        executeCount += 1
        return { summary: "不应执行", statePatch: {} }
      },
      save: async () => undefined,
    })

    expect(result.status).toBe("failed")
    expect(executeCount).toBe(0)
    expect(result.toolCalls[0]).toMatchObject({ toolName: "finish_task", status: "failed", resultSummary: "决策输出未通过 Schema 校验" })
  })

  it("rejects invalid state patches before saving them as successful state", async () => {
    const result = await runSupervisorWithDecisionProvider(createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"), {
      decide: async () => ({ type: "tool", reasoningSummary: "需要先分析问题", toolName: "analyze_problem", arguments: {} }),
      executeTool: async () => ({ summary: "返回坏状态", statePatch: { totalTokens: -1 } as never }),
      save: async () => undefined,
    })

    expect(result.status).toBe("failed")
    expect(result.currentStep).toBe(1)
    expect(result.toolCalls[0]).toMatchObject({ toolName: "analyze_problem", status: "failed", resultSummary: "工具执行失败" })
  })

  it("increments build attempts for generate_application tools", async () => {
    let decisionCount = 0
    const result = await runSupervisorWithDecisionProvider(createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"), {
      decide: async () => {
        decisionCount += 1
        return decisionCount === 1
          ? { type: "tool", reasoningSummary: "需要生成应用", toolName: "generate_application", arguments: {} }
          : { type: "finish", reasoningSummary: "停止" }
      },
      executeTool: async () => ({ summary: "生成完成", statePatch: {} }),
      save: async () => undefined,
    })

    expect(result.buildAttempts).toBe(1)
  })

  it("blocks build tools when build attempt budget is exhausted", async () => {
    let executeCount = 0
    const initial = { ...createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"), buildAttempts: 2 }

    const result = await runSupervisorWithDecisionProvider(initial, {
      decide: async () => ({ type: "tool", reasoningSummary: "再次生成应用", toolName: "generate_application", arguments: {} }),
      executeTool: async () => {
        executeCount += 1
        return { summary: "不应执行", statePatch: {} }
      },
      save: async () => undefined,
    })

    expect(result.status).toBe("failed")
    expect(executeCount).toBe(0)
    expect(result.toolCalls[0]).toMatchObject({ toolName: "generate_application", status: "failed", resultSummary: "工具调用预算已耗尽" })
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

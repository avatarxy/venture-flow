import { describe, expect, it } from "vitest"
import { createInitialAgentState } from "./state-factory"
import { createToolRegistry } from "./tool-registry"

describe("createToolRegistry", () => {
  it("returns registered runtime tools by whitelist name", async () => {
    const registry = createToolRegistry([
      {
        name: "analyze_problem",
        execute: async () => ({ summary: "分析完成", statePatch: { totalTokens: 10 } }),
      },
    ])

    const tool = registry.get("analyze_problem")
    const result = await tool.execute({}, createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"))

    expect(result.summary).toBe("分析完成")
    expect(result.statePatch.totalTokens).toBe(10)
  })

  it("rejects unregistered runtime tools", () => {
    const registry = createToolRegistry([])

    expect(() => registry.get("analyze_problem")).toThrow("Tool is not registered: analyze_problem")
  })
})

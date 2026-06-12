import { describe, expect, it } from "vitest"
import { validStrategy } from "@/server/agent/agent-fixtures"
import { createStrategyDisplayModel } from "./StrategyCard"

describe("createStrategyDisplayModel", () => {
  it("uses structured strategy data instead of duplicating raw markdown content", () => {
    const model = createStrategyDisplayModel("## 📋 业务分析结果\n\n**推荐应用模式**\ncrm", validStrategy)

    expect(model.rawContent).toBeUndefined()
    expect(model.problemSummary).toBe(validStrategy.problemSummary)
    expect(model.recommendedAppPattern).toBe("crm")
    expect(model.painPoints).toEqual(validStrategy.painPoints)
    expect(model.successMetrics).toEqual(validStrategy.successMetrics)
  })

  it("falls back to raw content when structured strategy data is unavailable", () => {
    expect(createStrategyDisplayModel("分析正在生成", undefined)).toEqual({
      rawContent: "分析正在生成",
      problemSummary: "",
      targetUsers: [],
      painPoints: [],
      desiredOutcomes: [],
      successMetrics: [],
      recommendedAppPattern: "",
    })
  })
})

import { describe, expect, it, vi } from "vitest"
import { createBlueprint } from "./create-blueprint"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { validStrategy } from "@/server/agent/agent-fixtures"

vi.mock("@/server/ai/generate-structured", () => ({
  generateStructuredObject: vi.fn(),
}))

const mockedGenerateStructuredObject = vi.mocked(generateStructuredObject)

describe("createBlueprint", () => {
  it("normalizes generated Chinese technical identifiers before strict validation", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      productName: "销售线索管理",
      description: "用于统一管理销售线索、客户跟进状态和销售团队协作的轻量 CRM 应用。",
      problemSummary: "销售团队使用 Excel 管理客户，导致线索跟进不及时。",
      targetUsers: ["销售代表", "销售经理"],
      goals: ["减少漏跟", "统一客户数据"],
      successMetrics: ["线索转化率", "平均响应时间"],
      appPattern: "crm",
      entities: [
        {
          name: "线索",
          label: "线索",
          fields: [
            { name: "名称", label: "名称", type: "string", required: true },
            { name: "状态", label: "状态", type: "status", required: true, options: ["新建", "跟进中", "已成交"] },
          ],
        },
      ],
      pages: [
        {
          id: "线索列表",
          name: "线索列表",
          route: "/线索列表",
          purpose: "展示销售线索列表和当前跟进状态",
          components: [{ type: "table", title: "线索列表", entityName: "线索" }],
        },
        {
          id: "仪表盘",
          name: "仪表盘",
          route: "/",
          purpose: "展示销售经理关注的核心销售指标",
          components: [{ type: "dashboard", title: "销售概览", entityName: "线索" }],
        },
      ],
      workflows: [{ title: "跟进线索", steps: ["创建线索", "更新状态"] }],
      decisions: [{ title: "轻量 CRM", decision: "使用列表和仪表盘", reason: "匹配线索管理", tradeoff: "不支持复杂权限" }],
      seedData: {
        线索: [{ 名称: "Acme", 状态: "跟进中" }],
      },
    })

    const blueprint = await createBlueprint({
      originalProblem: "销售团队在用 Excel 管理客户，经常漏跟线索",
      strategy: validStrategy,
    })

    expect(blueprint.entities[0]?.name).toBe("Lead")
    expect(blueprint.entities[0]?.fields.map((field) => field.name)).toEqual(["name", "status"])
    expect(blueprint.pages.map((page) => page.id)).toEqual(["leads", "dashboard"])
    expect(blueprint.pages[0]?.components[0]?.entityName).toBe("Lead")
    expect(Object.keys(blueprint.seedData)).toEqual(["Lead"])
    expect(blueprint.seedData.Lead?.[0]).toMatchObject({ name: "Acme", status: "跟进中" })
  })
})

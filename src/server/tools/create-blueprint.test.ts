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
        {
          id: "线索看板",
          name: "线索看板",
          route: "/线索看板",
          purpose: "按阶段展示销售线索并支持销售状态流转",
          components: [{ type: "kanban", title: "线索看板", entityName: "线索" }],
        },
        {
          id: "跟进记录",
          name: "跟进记录",
          route: "/跟进记录",
          purpose: "记录销售沟通内容和下一次跟进计划",
          components: [{ type: "form", title: "跟进记录", entityName: "线索" }],
        },
        {
          id: "销售报表",
          name: "销售报表",
          route: "/销售报表",
          purpose: "分析销售预测、线索转化和跟进效率",
          components: [{ type: "chart", title: "销售报表", entityName: "线索" }],
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
    expect(blueprint.pages.map((page) => page.id)).toEqual(["leads", "dashboard", "kanban", "follow-ups", "reports"])
    expect(blueprint.pages[0]?.components[0]?.entityName).toBe("Lead")
    expect(Object.keys(blueprint.seedData)).toEqual(["Lead"])
    expect(blueprint.seedData.Lead?.[0]).toMatchObject({ name: "Acme", status: "跟进中" })
  })

  it("instructs the model to create a right-sized product blueprint without forcing five pages", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      productName: "销售线索运营系统",
      description: "用于统一管理销售线索、客户跟进、待办提醒和销售预测的完整 CRM 产品。",
      problemSummary: "销售团队使用 Excel 管理客户，导致线索跟进不及时。",
      targetUsers: ["销售代表", "销售经理"],
      goals: ["减少漏跟", "提升线索转化"],
      successMetrics: ["按时跟进率", "线索转化率"],
      appPattern: "crm",
      entities: [
        {
          name: "Lead",
          label: "线索",
          fields: [
            { name: "name", label: "名称", type: "string", required: true },
            { name: "status", label: "状态", type: "status", required: true, options: ["新建", "跟进中", "已成交"] },
          ],
        },
        {
          name: "Customer",
          label: "客户",
          fields: [{ name: "name", label: "名称", type: "string", required: true }],
        },
      ],
      pages: [
        { id: "dashboard", name: "仪表盘", route: "/", purpose: "展示销售核心指标和风险提醒", components: [{ type: "dashboard", title: "销售概览", entityName: "Lead" }] },
        { id: "leads", name: "线索列表", route: "/leads", purpose: "管理线索列表、搜索筛选和批量跟进", components: [{ type: "table", title: "线索列表", entityName: "Lead" }] },
        { id: "kanban", name: "线索看板", route: "/kanban", purpose: "按阶段拖动和更新销售线索状态", components: [{ type: "kanban", title: "线索看板", entityName: "Lead" }] },
        { id: "customers", name: "客户", route: "/customers", purpose: "管理客户档案和联系人信息", components: [{ type: "table", title: "客户列表", entityName: "Customer" }] },
        { id: "follow-ups", name: "跟进记录", route: "/follow-ups", purpose: "记录每次跟进和下次跟进计划", components: [{ type: "form", title: "跟进记录", entityName: "Lead" }] },
        { id: "reports", name: "销售报表", route: "/reports", purpose: "分析销售预测、转化率和跟进效率", components: [{ type: "chart", title: "销售预测", entityName: "Lead" }] },
      ],
      workflows: [
        { title: "线索录入", steps: ["新增线索", "分配负责人"] },
        { title: "线索跟进", steps: ["记录沟通", "设置下次跟进"] },
        { title: "销售复盘", steps: ["查看报表", "优化跟进计划"] },
      ],
      decisions: [{ title: "完整 CRM", decision: "生成多页面 local-first 产品", reason: "解决 Excel 漏跟问题需要完整流程", tradeoff: "暂不接入后端数据库" }],
      seedData: {
        Lead: [{ name: "Acme", status: "跟进中" }],
        Customer: [{ name: "Acme" }],
      },
    })

    await createBlueprint({
      originalProblem: "销售团队在用 Excel 管理客户，经常漏跟线索",
      strategy: validStrategy,
    })

    const system = mockedGenerateStructuredObject.mock.calls[0]?.[0].system ?? ""

    expect(system).toContain("页面按业务复杂度规划为 1-8 个真实页面")
    expect(system).toContain("页面数量不追求固定模板")
    expect(system).not.toContain("5-8 个页面")
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("禁止生成“建设中”"),
      }),
    )
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("销售团队在用 Excel 管理客户，经常漏跟线索"),
      }),
    )
  })

  it("accepts a right-sized generated blueprint with fewer than five pages", async () => {
    const generatedBlueprint = {
      productName: "线索跟进助手",
      description: "用于统一记录销售线索、提醒下一次跟进并减少漏跟的轻量 CRM 产品。",
      problemSummary: "销售团队使用 Excel 管理客户，导致线索跟进不及时。",
      targetUsers: ["销售代表", "销售经理"],
      goals: ["减少漏跟", "提升线索跟进效率"],
      successMetrics: ["按时跟进率", "逾期线索数量"],
      appPattern: "crm",
      entities: [
        {
          name: "Lead",
          label: "线索",
          fields: [
            { name: "name", label: "名称", type: "string", required: true },
            { name: "status", label: "状态", type: "status", required: true, options: ["新建", "跟进中", "已成交"] },
          ],
        },
      ],
      pages: [
        { id: "dashboard", name: "仪表盘", route: "/", purpose: "展示线索跟进风险和关键指标", components: [{ type: "dashboard", title: "跟进概览", entityName: "Lead" }] },
        { id: "leads", name: "线索", route: "/leads", purpose: "管理线索列表、状态和下一次跟进", components: [{ type: "table", title: "线索列表", entityName: "Lead" }] },
      ],
      workflows: [{ title: "跟进线索", steps: ["新增线索", "更新跟进状态"] }],
      decisions: [{ title: "轻量线索管理", decision: "生成两页 CRM 产品", reason: "两页即可覆盖概览和线索管理闭环", tradeoff: "暂不拆分复杂报表" }],
      seedData: {
        Lead: [{ name: "Acme", status: "跟进中" }],
      },
    }
    mockedGenerateStructuredObject.mockResolvedValueOnce(generatedBlueprint)

    const blueprint = await createBlueprint({
      originalProblem: "销售团队在用 Excel 管理客户，经常漏跟线索",
      strategy: validStrategy,
    })

    const schema = mockedGenerateStructuredObject.mock.calls[0]?.[0].schema
    expect(schema.safeParse(generatedBlueprint).success).toBe(true)
    expect(blueprint.pages).toHaveLength(2)
  })
})

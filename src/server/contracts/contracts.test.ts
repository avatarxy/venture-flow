import { describe, expect, it } from "vitest"
import { agentActionSchema, productBlueprintSchema, strategyOutputSchema } from "."

const validBlueprint = {
  productName: "销售管理",
  description: "用于管理销售线索和跟进状态的轻量 CRM。",
  problemSummary: "销售线索分散，团队缺少统一跟进工具。",
  targetUsers: ["销售负责人"],
  goals: ["减少遗漏"],
  successMetrics: ["按时跟进率"],
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
    {
      id: "leads",
      name: "线索",
      route: "/leads",
      purpose: "展示核心线索列表和跟进状态",
      components: [{ type: "table", title: "线索列表", entityName: "Lead" }],
    },
    {
      id: "dashboard",
      name: "仪表盘",
      route: "/",
      purpose: "展示销售负责人需要追踪的核心指标",
      components: [{ type: "dashboard", title: "销售概览" }],
    },
  ],
  workflows: [{ title: "跟进线索", steps: ["创建线索", "更新状态"] }],
  decisions: [{ title: "轻量 CRM", decision: "使用列表和看板", reason: "匹配线索管理", tradeoff: "不支持复杂权限" }],
  seedData: {
    Lead: [
      {
        name: "Acme",
        status: "跟进中",
        score: 80,
        active: true,
        notes: null,
        tags: ["重点客户"],
      },
    ],
  },
} as const

describe("contracts", () => {
  it("validates strategy output", () => {
    const result = strategyOutputSchema.safeParse({
      problemSummary: "销售线索分散，团队缺少统一跟进工具。",
      targetUsers: ["销售负责人"],
      painPoints: ["跟进容易遗漏"],
      desiredOutcomes: ["提高按时跟进率"],
      successMetrics: ["按时跟进率"],
      facts: ["当前使用 Excel 管理客户"],
      assumptions: ["每条线索存在明确阶段"],
      validationQuestions: ["是否需要邮件集成"],
      recommendedAppPattern: "crm",
    })

    expect(result.success).toBe(true)
  })

  it("rejects blueprint with too many pages", () => {
    const result = productBlueprintSchema.safeParse({
      ...validBlueprint,
      pages: Array.from({ length: 6 }, (_, index) => ({
        id: `page-${index}`,
        name: "页面",
        route: `/p${index}`,
        purpose: "展示核心业务信息",
        components: [{ type: "table", title: "列表" }],
      })),
    })

    expect(result.success).toBe(false)
  })

  it("accepts only whitelisted tool names", () => {
    const result = agentActionSchema.safeParse({
      type: "tool",
      reasoningSummary: "需要先分析问题",
      toolName: "analyze_problem",
      arguments: { problem: "销售线索分散" },
    })

    expect(result.success).toBe(true)
  })

  it("rejects non-json tool arguments", () => {
    const result = agentActionSchema.safeParse({
      type: "tool",
      reasoningSummary: "需要先分析问题",
      toolName: "analyze_problem",
      arguments: { run: () => null },
    })

    expect(result.success).toBe(false)
  })
})

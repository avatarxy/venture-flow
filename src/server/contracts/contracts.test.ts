import { describe, expect, it } from "vitest"
import {
  agentActionSchema,
  agentStateSchema,
  buildOutputSchema,
  productBlueprintSchema,
  reviewResultSchema,
  strategyOutputSchema,
} from "."

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
      pages: Array.from({ length: 9 }, (_, index) => ({
        id: `page-${index}`,
        name: "页面",
        route: `/p${index}`,
        purpose: "展示核心业务信息",
        components: [{ type: "table", title: "列表" }],
      })),
    })

    expect(result.success).toBe(false)
  })

  it("accepts complete product blueprint with six pages", () => {
    const result = productBlueprintSchema.safeParse({
      ...validBlueprint,
      entities: [
        validBlueprint.entities[0],
        {
          name: "Customer",
          label: "客户",
          fields: [
            { name: "name", label: "名称", type: "string", required: true },
            { name: "owner", label: "负责人", type: "string", required: true },
          ],
        },
      ],
      pages: [
        validBlueprint.pages[0],
        validBlueprint.pages[1],
        {
          id: "customers",
          name: "客户",
          route: "/customers",
          purpose: "管理客户档案和负责人信息",
          components: [{ type: "table", title: "客户列表", entityName: "Customer" }],
        },
        {
          id: "follow-ups",
          name: "跟进",
          route: "/follow-ups",
          purpose: "记录每次销售沟通和下一步计划",
          components: [{ type: "form", title: "跟进记录", entityName: "Lead" }],
        },
        {
          id: "tasks",
          name: "待办",
          route: "/tasks",
          purpose: "追踪销售团队每日待办和逾期提醒",
          components: [{ type: "table", title: "待办列表", entityName: "Lead" }],
        },
        {
          id: "reports",
          name: "报表",
          route: "/reports",
          purpose: "展示销售预测、漏斗转化和跟进效率",
          components: [{ type: "chart", title: "销售预测", entityName: "Lead" }],
        },
      ],
      seedData: {
        Lead: validBlueprint.seedData.Lead,
        Customer: [{ name: "Acme", owner: "张三" }],
      },
    })

    expect(result.success).toBe(true)
  })

  it("rejects blueprint references to unknown entities", () => {
    const result = productBlueprintSchema.safeParse({
      ...validBlueprint,
      pages: [
        validBlueprint.pages[0],
        {
          ...validBlueprint.pages[1],
          components: [{ type: "table", title: "客户列表", entityName: "Customer" }],
        },
      ],
      seedData: { Customer: [] },
    })

    expect(result.success).toBe(false)
  })

  it("requires generated builds to include a unique /App.tsx entrypoint", () => {
    const result = buildOutputSchema.safeParse({
      summary: "生成线索管理应用",
      files: [
        { path: "/App.tsx", content: "export default function App() { return null }" },
        { path: "/App.tsx", content: "export default function Duplicate() { return null }" },
      ],
    })

    expect(result.success).toBe(false)
  })

  it("rejects unsafe generated file paths", () => {
    const result = buildOutputSchema.safeParse({
      summary: "生成线索管理应用",
      files: [
        { path: "/App.tsx", content: "export default function App() { return null }" },
        { path: "/components/../storage.ts", content: "export const key = 'x'" },
      ],
    })

    expect(result.success).toBe(false)
  })

  it("rejects inconsistent review results", () => {
    const result = reviewResultSchema.safeParse({
      passed: true,
      issues: [{ type: "missing_file", message: "缺少入口文件", severity: "high" }],
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

  it("restores persisted agent state with nullable stage outputs", () => {
    const result = agentStateSchema.safeParse({
      projectId: "project_1",
      originalProblem: "销售团队在用 Excel 管理客户，经常漏跟线索",
      goal: "将业务问题转化为可运行、可分析、可迭代的业务应用",
      currentPlan: [{ title: "分析业务问题", status: "pending" }],
      currentStep: 0,
      strategy: null,
      blueprint: null,
      build: null,
      review: null,
      optimization: null,
      capabilities: null,
      toolCalls: [],
      buildAttempts: 0,
      repairAttempts: 0,
      totalTokens: 0,
      status: "planning",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.strategy).toBeUndefined()
      expect(result.data.capabilities).toBeUndefined()
    }
  })
})

import { describe, expect, it } from "vitest"
import { optimizeProduct, optimizeProductInputSchema } from "./optimize-product"

const blueprint = {
  productName: "Sales CRM",
  description: "A lightweight CRM for sales teams to capture and follow up leads.",
  problemSummary: "Sales team loses leads.",
  targetUsers: ["Sales rep"],
  goals: ["Capture every lead"],
  successMetrics: ["Created leads"],
  appPattern: "crm",
  entities: [
    {
      name: "Lead",
      label: "Lead",
      description: "Sales lead",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "status", label: "Status", type: "status", required: true },
      ],
    },
  ],
  pages: [
    {
      id: "leads",
      name: "Leads",
      route: "/leads",
      purpose: "Manage sales leads and follow-up status",
      components: [{ type: "table", title: "Lead table", entityName: "Lead" }],
    },
    {
      id: "dashboard",
      name: "Dashboard",
      route: "/dashboard",
      purpose: "Review lead pipeline performance",
      components: [{ type: "dashboard", title: "Pipeline dashboard", entityName: "Lead" }],
    },
  ],
  workflows: [{ title: "Lead follow-up", steps: ["Create lead", "Update status"] }],
  decisions: [
    {
      title: "Use CRM pattern",
      decision: "Build a lightweight CRM",
      reason: "The team needs lead tracking",
      tradeoff: "Less workflow automation in MVP",
    },
  ],
  seedData: { Lead: [{ name: "Acme", status: "New" }] },
}

describe("optimizeProductInputSchema", () => {
  it("accepts empty usage events so the tool can return an insufficient data result", () => {
    expect(
      optimizeProductInputSchema.parse({
        blueprint,
        usageEvents: [],
      }),
    ).toEqual({
      blueprint,
      usageEvents: [],
    })
  })

  it("returns a controlled insufficient data result for empty usage events", async () => {
    await expect(optimizeProduct({ blueprint: optimizeProductInputSchema.parse({ blueprint, usageEvents: [] }).blueprint, usageEvents: [] })).resolves.toEqual({
      findings: [
        {
          title: "真实使用数据不足",
          evidence: ["Usage Events 数量为 0"],
          inference: "当前无法基于真实用户行为判断产品改进优先级。",
        },
      ],
      recommendations: [
        {
          title: "继续收集真实使用数据",
          description: "先发布当前版本并收集访问、创建、搜索、筛选和状态变更等事件，再生成优化建议。",
          priority: "low",
          evidence: ["Usage Events 数量为 0"],
          inference: "缺少真实行为样本时，优化建议只能作为下一步数据采集任务。",
          expectedImpact: "避免基于无证据推断改动产品。",
          targetComponents: ["Usage Analytics"],
        },
      ],
    })
  })
})

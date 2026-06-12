import type { ProductBlueprint, ReviewResult, StrategyOutput } from "@/server/contracts"

export const validStrategy: StrategyOutput = {
  problemSummary: "销售线索分散，团队缺少统一跟进工具。",
  targetUsers: ["销售负责人"],
  painPoints: ["跟进容易遗漏"],
  desiredOutcomes: ["提高按时跟进率"],
  successMetrics: ["按时跟进率"],
  facts: ["当前使用 Excel 管理客户"],
  assumptions: ["每条线索存在明确阶段"],
  validationQuestions: ["是否需要邮件集成"],
  recommendedAppPattern: "crm",
}

export const validBlueprint: ProductBlueprint = {
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
    {
      id: "dashboard",
      name: "仪表盘",
      route: "/",
      purpose: "展示销售负责人需要追踪的核心指标",
      components: [{ type: "dashboard", title: "销售概览", entityName: "Lead" }],
    },
    {
      id: "leads",
      name: "线索",
      route: "/leads",
      purpose: "展示核心线索列表和跟进状态",
      components: [{ type: "table", title: "线索列表", entityName: "Lead" }],
    },
    {
      id: "kanban",
      name: "线索看板",
      route: "/kanban",
      purpose: "按销售阶段管理线索流转和优先级",
      components: [{ type: "kanban", title: "线索看板", entityName: "Lead" }],
    },
    {
      id: "customers",
      name: "客户",
      route: "/customers",
      purpose: "管理客户档案、负责人和关联线索",
      components: [{ type: "table", title: "客户列表", entityName: "Customer" }],
    },
    {
      id: "follow-ups",
      name: "跟进",
      route: "/follow-ups",
      purpose: "记录销售沟通内容和下次跟进计划",
      components: [{ type: "form", title: "跟进记录", entityName: "Lead" }],
    },
    {
      id: "reports",
      name: "报表",
      route: "/reports",
      purpose: "分析销售预测、转化率和跟进效率",
      components: [{ type: "chart", title: "销售预测", entityName: "Lead" }],
    },
  ],
  workflows: [
    { title: "线索录入", steps: ["创建线索", "分配负责人"] },
    { title: "跟进线索", steps: ["记录沟通", "更新状态"] },
    { title: "销售复盘", steps: ["查看报表", "优化跟进计划"] },
  ],
  decisions: [{ title: "轻量 CRM", decision: "使用列表和看板", reason: "匹配线索管理", tradeoff: "不支持复杂权限" }],
  seedData: {
    Lead: [{ name: "Acme", status: "跟进中" }],
    Customer: [{ name: "Acme", owner: "张三" }],
  },
}

export const passingReview: ReviewResult = {
  passed: true,
  issues: [],
}

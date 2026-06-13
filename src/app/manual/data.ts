// 使用手册 — 面向用户的产品功能与操作指南

export type ManualEntry = {
  slug: string
  title: string
  description: string
  category: "入门" | "功能指南" | "进阶"
  order: number
  readTime: string
}

export type ManualSection = {
  id: string
  title: string
  level: 2 | 3
}

export type ManualData = {
  entry: ManualEntry
  sections: ManualSection[]
  content: string
}

export const manualEntries: ManualEntry[] = [
  {
    slug: "overview",
    title: "产品概述",
    description: "VentureFlow 能帮你做什么、怎么工作、适合什么样的场景。",
    category: "入门",
    order: 1,
    readTime: "5 分钟",
  },
  {
    slug: "quick-start",
    title: "快速上手",
    description: "从零开始创建第一个项目，5 分钟跑通完整流程。",
    category: "入门",
    order: 2,
    readTime: "6 分钟",
  },
  {
    slug: "create-project",
    title: "创建项目与描述问题",
    description: "怎么写问题描述能让 Agent 更好地理解你的业务需求。",
    category: "入门",
    order: 3,
    readTime: "5 分钟",
  },
  {
    slug: "understand-strategy",
    title: "理解策略分析",
    description: "Strategy 卡片怎么看、每一部分代表什么、如何反馈调整。",
    category: "功能指南",
    order: 4,
    readTime: "6 分钟",
  },
  {
    slug: "work-with-blueprint",
    title: "使用产品蓝图",
    description: "Blueprint 的结构、如何读懂实体和页面、怎样提出修改意见。",
    category: "功能指南",
    order: 5,
    readTime: "7 分钟",
  },
  {
    slug: "use-generated-app",
    title: "操作生成应用",
    description: "在预览面板中直接使用生成的应用、新增修改数据、搜索筛选。",
    category: "功能指南",
    order: 6,
    readTime: "6 分钟",
  },
  {
    slug: "analytics-guide",
    title: "查看使用分析",
    description: "Analytics 面板的指标解读、数据含义、如何发现使用模式。",
    category: "功能指南",
    order: 7,
    readTime: "5 分钟",
  },
  {
    slug: "iterate-improve",
    title: "迭代与优化",
    description: "看懂 Growth Agent 的优化建议、Apply Improvement 生成新版本。",
    category: "进阶",
    order: 8,
    readTime: "6 分钟",
  },
  {
    slug: "tips-and-best-practices",
    title: "技巧与最佳实践",
    description: "高效使用 VentureFlow 的经验、常见问题规避、典型场景模板。",
    category: "进阶",
    order: 9,
    readTime: "8 分钟",
  },
]

export function getManualEntry(slug: string): ManualEntry | undefined {
  return manualEntries.find((d) => d.slug === slug)
}

export function getManualCategoryEntries(): Record<string, ManualEntry[]> {
  const map: Record<string, ManualEntry[]> = {}
  for (const entry of manualEntries) {
    if (!map[entry.category]) map[entry.category] = []
    map[entry.category].push(entry)
  }
  return map
}

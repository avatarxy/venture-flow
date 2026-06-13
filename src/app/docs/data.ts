// 文档目录结构 — 与 docs/ 文件夹一一对应
// 使用普通字符串 key，避免 Turbopack / Next.js 16 tree-shaking 和导出问题

export type DocEntry = {
  slug: string
  title: string
  description: string
  category: "概述" | "开发指南" | "参考" | "验收"
  order: number
  readTime: string
}

export type DocSection = {
  id: string
  title: string
  level: 2 | 3
}

export type DocData = {
  entry: DocEntry
  sections: DocSection[]
  content: string // Markdown 文本，由 DocArticle 渲染
}

// ─── 文档索引 ────────────────────────────────────────────────────────
export const docEntries: DocEntry[] = [
  {
    slug: "overview",
    title: "产品总览",
    description: "VentureFlow 是什么、解决什么问题、怎么运作、适合谁用。",
    category: "概述",
    order: 0,
    readTime: "8 分钟",
  },
  {
    slug: "technical-architecture",
    title: "技术架构方案",
    description: "VentureFlow MVP 的技术选型、系统架构、数据流和安全边界。",
    category: "概述",
    order: 1,
    readTime: "12 分钟",
  },
  {
    slug: "plan",
    title: "开发任务总览",
    description: "MVP 模块拆分、执行顺序、模块依赖和 P0 完成定义。",
    category: "概述",
    order: 2,
    readTime: "6 分钟",
  },
  {
    slug: "01-foundation",
    title: "基础工程与开发规范",
    description: "Next.js 工程初始化、Tailwind 主题配置、环境校验和全局布局。",
    category: "开发指南",
    order: 3,
    readTime: "8 分钟",
  },
  {
    slug: "02-data-model",
    title: "数据模型与持久化",
    description: "Prisma Schema 设计、PostgreSQL 迁移、Repository 层和 Zod 校验集成。",
    category: "开发指南",
    order: 4,
    readTime: "10 分钟",
  },
  {
    slug: "03-contracts-and-schemas",
    title: "类型契约与 Schema",
    description: "Agent Action、Blueprint、Strategy、ReviewResult 等核心 Zod Schema。",
    category: "开发指南",
    order: 5,
    readTime: "9 分钟",
  },
  {
    slug: "04-agent-orchestration",
    title: "Agent 编排与对话式 Supervisor",
    description: "自主管道 + 对话干预混合模式、意图解析、SSE 流式、消息 API。",
    category: "开发指南",
    order: 6,
    readTime: "14 分钟",
  },
  {
    slug: "05-ai-tools-and-generation",
    title: "AI 工具与应用生成",
    description: "11 个 Mastra Tool 的完整实现，含 LLM 生成工具和本地校验工具。",
    category: "开发指南",
    order: 7,
    readTime: "12 分钟",
  },
  {
    slug: "06-workspace-ui",
    title: "Chat UI + Preview 双栏界面",
    description: "ChatPanel、ChatMessage、8 种消息卡片、进度条和双栏布局实现。",
    category: "开发指南",
    order: 8,
    readTime: "11 分钟",
  },
  {
    slug: "07-preview-runtime",
    title: "Sandpack Preview 与公开预览",
    description: "生成应用在浏览器安全运行、文件规范化、公开预览和事件追踪。",
    category: "开发指南",
    order: 9,
    readTime: "9 分钟",
  },
  {
    slug: "08-analytics-growth-iteration",
    title: "Usage Analytics 与自动迭代",
    description: "事件采集、指标聚合、Growth Agent 优化建议和版本迭代机制。",
    category: "开发指南",
    order: 10,
    readTime: "10 分钟",
  },
  {
    slug: "09-deploy-observability-demo",
    title: "部署、可观测性与 Demo 验收",
    description: "Vercel 部署配置、系统日志、Demo 数据、验收清单和 E2E 测试。",
    category: "开发指南",
    order: 11,
    readTime: "7 分钟",
  },
  {
    slug: "acceptance-checklist",
    title: "MVP 验收清单",
    description: "P0 链路的完整验收条件，确保每个核心功能都经过验证。",
    category: "验收",
    order: 12,
    readTime: "4 分钟",
  },
  {
    slug: "demo-script",
    title: "Demo 演示脚本",
    description: "逐步演示指南，从打开首页到 Apply Improvement 的完整流程。",
    category: "验收",
    order: 13,
    readTime: "5 分钟",
  },
]

export function getDocEntry(slug: string): DocEntry | undefined {
  return docEntries.find((d) => d.slug === slug)
}

export function getDocCategoryEntries(): Record<string, DocEntry[]> {
  const map: Record<string, DocEntry[]> = {}
  for (const entry of docEntries) {
    if (!map[entry.category]) map[entry.category] = []
    map[entry.category].push(entry)
  }
  return map
}

export type Article = {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  readTime: string
  date: string
  imageUrl: string
  imageCredit: string
}

export const articles: Article[] = [
  {
    slug: "ai-business-app-generation-guide",
    title: "从业务问题到可运行应用：AI 生成式开发完整指南",
    description:
      "深入解析如何用 AI Agent 将模糊的业务痛点转化为策略分析、产品蓝图和可运行的 Web 应用，覆盖从需求输入到迭代优化的全流程。",
    category: "产品实践",
    tags: ["AI Agent", "应用生成", "MVP"],
    readTime: "8 分钟",
    date: "2026-06-10",
    imageUrl:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Brooke Lark on Unsplash",
  },
  {
    slug: "llm-agents-enterprise-2026",
    title: "2026 年 LLM Agent 在企业级应用中的五个关键趋势",
    description:
      "从单轮对话到多步骤任务编排，LLM Agent 正从聊天机器人演变为真正的业务执行者。梳理五个正在重塑企业软件格局的趋势。",
    category: "行业洞察",
    tags: ["LLM", "Agent", "趋势"],
    readTime: "10 分钟",
    date: "2026-06-08",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Google DeepMind on Unsplash",
  },
  {
    slug: "mvp-methodology-ai-era",
    title: "MVP 方法论在 AI 时代的新演进",
    description:
      "传统 MVP 需要数周甚至数月的开发周期。AI 生成式开发将 MVP 压缩到小时级别，产品验证的方式也因此发生了根本性变化。",
    category: "产品实践",
    tags: ["MVP", "精益创业", "AI"],
    readTime: "6 分钟",
    date: "2026-06-05",
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Firmbee on Unsplash",
  },
  {
    slug: "reduce-software-cost-with-ai",
    title: "用 AI 将企业软件交付成本降低 80% 的实践路径",
    description:
      "分析传统外包开发与 AI 生成式开发在成本、周期和质量三个维度的数据对比，给出可落地的降本增效方案。",
    category: "实战分享",
    tags: ["成本优化", "AI 开发", "效率"],
    readTime: "7 分钟",
    date: "2026-06-03",
    imageUrl:
      "https://images.unsplash.com/photo-1553729459-afe8f6b0e7e4?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Scott Graham on Unsplash",
  },
  {
    slug: "ai-agent-architecture-deep-dive",
    title: "AI Agent 架构深度解析：从 Supervisor 到 Tool Executor",
    description:
      "拆解多 Agent 协作系统的设计原理，包括任务编排、状态管理、错误恢复和上下文传递等核心技术要点。",
    category: "技术深究",
    tags: ["Agent 架构", "编排", "后端"],
    readTime: "12 分钟",
    date: "2026-05-28",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Alexandre Debiève on Unsplash",
  },
  {
    slug: "nocode-lowcode-future",
    title: "低代码 / 无代码平台的终极形态：AI 原生应用工厂",
    description:
      "从拖拽式搭建到自然语言描述即生成，低代码平台正在经历第三次范式跃迁。探讨 AI 原生时代的企业应用交付模式。",
    category: "行业洞察",
    tags: ["低代码", "无代码", "平台"],
    readTime: "9 分钟",
    date: "2026-05-25",
    imageUrl:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Ilya Pavlov on Unsplash",
  },
  {
    slug: "data-driven-product-iteration",
    title: "数据驱动的产品迭代：从使用分析到自动优化",
    description:
      "产品上线只是开始。如何通过真实使用数据分析用户行为，并将洞察反馈到 AI 生成流水线中，实现自动化的产品迭代。",
    category: "产品实践",
    tags: ["数据分析", "迭代", "增长"],
    readTime: "8 分钟",
    date: "2026-05-20",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Luke Chesser on Unsplash",
  },
  {
    slug: "enterprise-digital-transformation-shortcut",
    title: "中小企业数字化转型的捷径：直接生成，而非购买",
    description:
      "传统 SaaS 产品往往与企业的实际流程存在鸿沟。AI 生成式开发让企业拥有成本可负担的定制化软件，重新定义数字化转型路径。",
    category: "实战分享",
    tags: ["数字化转型", "中小企业", "SaaS"],
    readTime: "6 分钟",
    date: "2026-05-15",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Patrick Tomasso on Unsplash",
  },
  {
    slug: "ai-developer-role-transformation",
    title: "AI 时代的开发者：从写代码到设计问题解决流程",
    description:
      "当 AI 能自动生成 80% 的应用代码时，开发者的核心价值正在从实现转向定义。如何适应这一角色的转变？",
    category: "行业洞察",
    tags: ["开发者", "职业发展", "AI"],
    readTime: "7 分钟",
    date: "2026-05-10",
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Headway on Unsplash",
  },
  {
    slug: "sandpack-browser-compilation",
    title: "Sandpack 原理探秘：如何在浏览器中编译运行 React 应用",
    description:
      "Sandpack 使用 Nodebox 运行时在浏览器中构建了一个微型 Node.js 环境。深入分析其架构、局限性与最佳实践。",
    category: "技术深究",
    tags: ["Sandpack", "WebContainers", "前端"],
    readTime: "10 分钟",
    date: "2026-05-05",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    imageCredit: "Photo by Caspar Camille Rubin on Unsplash",
  },
]

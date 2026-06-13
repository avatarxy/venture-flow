// 产品模板数据 — 展示通过 VentureFlow 可以创建的应用类型

export type TemplateEntry = {
  id: string
  title: string
  description: string
  problem: string // 预填的问题描述，用户点击"使用"后跳转首页
  userPersona: string // 目标用户画像
  tags: string[]
  imageUrl: string // 产品截图/示意（免费图库）
  category: "销售与客户" | "运营与管理" | "数据与分析" | "协作与流程"
}

export const templates: TemplateEntry[] = [
  {
    id: "crm-sales",
    title: "销售 CRM",
    description: "客户线索管理、跟进追踪、转化漏斗分析，适合销售团队统一管理商机。",
    problem: "我们销售团队 5 个人，用 Excel 和微信群管客户线索。A 跟过的客户 B 不知道，经常重复联系。月底老板要报表，每个人整理的格式都不一样，汇总要花半天。需要一个统一的客户跟进系统，能看到每条线索的状态、负责人和最新跟进记录。",
    userPersona: "销售主管、销售代表、中小型 B2B 团队",
    tags: ["CRM", "销售管理", "线索追踪"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format",
    category: "销售与客户",
  },
  {
    id: "ticket-system",
    title: "工单管理",
    description: "跨部门协作任务追踪、工单流转、状态看板，告别微信群里的任务碎片。",
    problem: "公司内部跨部门协作乱。A 部门提需求靠发微信，B 部门说做了但 A 部门说没收到。一个需求做了还是没做、做到哪了、谁在做——全靠猜和催。需要一个工单系统，能创建任务、分配人、追踪状态、记录完成时间。",
    userPersona: "运营主管、项目经理、跨部门协作团队",
    tags: ["工单", "任务管理", "跨部门协作"],
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&auto=format",
    category: "协作与流程",
  },
  {
    id: "inventory",
    title: "库存管理",
    description: "进销存统计、库存预警、批次追踪，中小商户的轻量级库存方案。",
    problem: "我们是个小批发商，仓库里有 200 多种货。现在用纸质记录和 Excel，经常记错库存数量，漏了补货导致断货。每个月盘点要花 2 天时间。需要一个简单的库存系统，能记录入库出库、实时查看库存量、低库存自动提醒。",
    userPersona: "仓库管理员、小批发商、零售店主",
    tags: ["库存", "进销存", "仓储"],
    imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop&auto=format",
    category: "运营与管理",
  },
  {
    id: "feedback-board",
    title: "用户反馈面板",
    description: "收集用户反馈、投票排序、需求跟踪，让产品迭代方向更清晰。",
    problem: "我们 SaaS 产品的用户反馈散落在邮件、客服对话和微信群里。不知道哪个需求呼声最高，用户也不知道他们的反馈有没有被采纳。需要一个反馈面板，用户能提交建议、给别人的建议投票，我们能看到排序和进度。",
    userPersona: "产品经理、SaaS 创业团队、客户成功团队",
    tags: ["反馈", "产品管理", "投票"],
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop&auto=format",
    category: "协作与流程",
  },
  {
    id: "content-planner",
    title: "内容排期",
    description: "内容选题、分配、排期到发布的全流程管理，内容团队不再延期。",
    problem: "内容团队每周产 10 篇文章和多条短视频。选题、分配写手、排期、进度跟踪全用在线表格。瓶颈在于多人编辑冲突频繁，状态更新靠手工改单元格，经常漏了某篇文章的排期。需要一个内容排期工具。",
    userPersona: "内容运营、新媒体团队、市场部",
    tags: ["内容管理", "排期", "日历"],
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop&auto=format",
    category: "运营与管理",
  },
  {
    id: "hr-recruitment",
    title: "招聘追踪",
    description: "职位发布、候选人管理、面试安排、Offer 追踪，HR 的招聘工作台。",
    problem: "HR 同时在招 8 个岗位，候选人信息记在 Excel 和个人微信里。面试安排靠企业日历，但候选人反馈和面试评价散落在不同地方，经常漏了候选人的下一步动作。需要一个招聘追踪系统，记录每个候选人的投递岗位、当前阶段、面试评价、下一步动作。",
    userPersona: "HR、招聘专员、中小型企业的人力部门",
    tags: ["HR", "招聘", "候选人管理"],
    imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop&auto=format",
    category: "运营与管理",
  },
  {
    id: "expense-tracker",
    title: "费用报销",
    description: "费用记录、审批、汇总报表，替代微信群里的报销图片轰炸。",
    problem: "团队 15 个人，每月报销靠拍照发微信给财务。财务手工录入 Excel，分类汇总要花一整天。而且经常有人忘记贴发票或用个人账户支付但忘了报销。需要一个在线报销工具，提交报销单、上传凭证、财务审批、自动分类汇总。",
    userPersona: "财务、行政、中小企业管理者",
    tags: ["财务", "报销", "审批"],
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop&auto=format",
    category: "运营与管理",
  },
  {
    id: "data-dashboard",
    title: "数据看板",
    description: "多数据源聚合、可视化仪表盘、自动刷新，业务数据一目了然。",
    problem: "运营团队需要每天手动从多个平台拉数据、做报表、发日报。数据源包括公众号后台、广告投放平台、CRM 系统。目前靠人工复制粘贴到 Excel 然后做图表，每天耗时 2 小时。需要一个能聚合多源数据、自动生成可视化看板的工具。",
    userPersona: "运营总监、数据分析师、业务负责人",
    tags: ["数据", "看板", "可视化"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format",
    category: "数据与分析",
  },
  {
    id: "order-management",
    title: "订单管理",
    description: "订单录入、状态跟踪、发货管理、对账记录，电商卖家的订单中台。",
    problem: "做电商代发，每天 50-100 单。订单来自多个平台（淘宝、拼多多、抖音），目前手工录入 Excel 然后发给仓库。经常录错收货地址和 SKU，漏发货的情况每月有 3-5 次。需要一个能录入订单、标记状态（待发货/已发货/已签收/退货）、按 SKU 汇总的工具。",
    userPersona: "电商运营、代发商家、小型电商团队",
    tags: ["电商", "订单", "发货"],
    imageUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop&auto=format",
    category: "销售与客户",
  },
  {
    id: "project-tracker",
    title: "项目追踪",
    description: "里程碑、任务分解、进度看板、风险登记，中小项目的轻量管理。",
    problem: "公司同时跑 5-6 个项目，PM 用 Excel 跟踪里程碑和任务。问题是任务依赖关系不直观，某个任务延迟了不知道会影响哪些下游。每周开进度会，大家各自报进度，但信息不对称严重。需要一个项目追踪工具，能看到里程碑、任务、负责人、状态和到期日。",
    userPersona: "项目经理、团队 Lead、创业者",
    tags: ["项目管理", "甘特图", "里程碑"],
    imageUrl: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&h=400&fit=crop&auto=format",
    category: "协作与流程",
  },
  {
    id: "meeting-notes",
    title: "会议纪要",
    description: "会议记录、待办分配、决议追踪，每次开会都有完整闭环。",
    problem: "公司每周开两次经营会，每次都有人负责记会议纪要，但纪要记完就丢在群里了。上次会议定的 Action Items 到底谁在做、做了没——下次开会才知道。需要一个会议纪要工具，记录会议主题和决议，分配待办并追踪完成状态。",
    userPersona: "行政、项目经理、创业团队",
    tags: ["会议", "待办", "协作"],
    imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop&auto=format",
    category: "协作与流程",
  },
  {
    id: "customer-service",
    title: "客服工单",
    description: "售后问题登记、处理流转、满意度追踪，客服团队的工作台。",
    problem: "客服团队 3 个人，每天处理约 40 个售后问题。问题来源包括在线客服、电话和企业微信。目前记录在共享 Excel 里，经常漏记、重复处理。而且每个问题处理了多久、客户满意度怎么样——完全没有数据。需要一个客服工单系统。",
    userPersona: "客服主管、售后团队、客户成功",
    tags: ["客服", "工单", "售后"],
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop&auto=format",
    category: "销售与客户",
  },
]

export const templateCategories = [
  "全部",
  "销售与客户",
  "运营与管理",
  "数据与分析",
  "协作与流程",
] as const

export function getTemplateById(id: string): TemplateEntry | undefined {
  return templates.find((t) => t.id === id)
}

export const demoInputs = [
  {
    title: "销售管理",
    problem: "我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。",
    expectedPattern: "crm",
  },
  {
    title: "客户反馈",
    problem: "客户反馈分散在邮件、群聊和客服系统中，我们无法判断哪些需求最重要，也无法让客户知道需求处理进度。",
    expectedPattern: "feedback-board",
  },
  {
    title: "内容运营",
    problem: "内容团队有大量选题，但缺少统一的排期、负责人和发布状态管理，导致内容经常延期。",
    expectedPattern: "content-planner",
  },
] as const

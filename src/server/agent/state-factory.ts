import type { AgentState } from "@/server/contracts"

export function createInitialAgentState(projectId: string, originalProblem: string): AgentState {
  return {
    projectId,
    originalProblem,
    goal: "将业务问题转化为可运行、可分析、可迭代的业务应用",
    currentPlan: [
      { title: "分析业务问题", status: "pending" },
      { title: "检查平台能力边界", status: "pending" },
      { title: "生成产品蓝图", status: "pending" },
      { title: "校验产品蓝图", status: "pending" },
      { title: "生成可运行应用", status: "pending" },
      { title: "审查并完成任务", status: "pending" },
    ],
    currentStep: 0,
    toolCalls: [],
    buildAttempts: 0,
    repairAttempts: 0,
    totalTokens: 0,
    status: "planning",
  }
}

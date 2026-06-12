import { prisma } from "@/server/db/client"

const demoProblem = "我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。"

export function validateProblemInput(problem: string) {
  if (problem.trim().length < 20) {
    throw new Error("业务问题至少需要 20 个字符")
  }
}

export function createProjectName(problem: string) {
  if (problem.includes("销售") || problem.includes("线索")) {
    return "销售团队线索管理"
  }

  if (problem.includes("反馈")) {
    return "客户反馈管理"
  }

  if (problem.includes("内容")) {
    return "内容运营管理"
  }

  return "业务问题解决方案"
}

export async function createProject(originalProblem: string) {
  validateProblemInput(originalProblem)

  return prisma.project.create({
    data: {
      name: createProjectName(originalProblem),
      originalProblem,
      status: "DRAFT",
    },
  })
}

function shouldUseDemoProject(projectId: string) {
  return process.env.VENTUREFLOW_ENABLE_DEMO_PROJECT === "1" && projectId === "demo-project"
}

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      originalProblem: true,
      updatedAt: true,
    },
  })
}

export async function getProject(projectId: string) {
  if (shouldUseDemoProject(projectId)) {
    return {
      id: "demo-project",
      name: "销售团队线索管理",
      originalProblem: demoProblem,
      status: "DRAFT",
      strategy: null,
      blueprint: null,
      currentVersionId: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      agentState: null,
      versions: [],
    }
  }

  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      agentState: true,
      versions: { orderBy: { version: "desc" } },
    },
  })
}

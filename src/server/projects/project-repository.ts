import { prisma } from "@/server/db/client"

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

export async function getProject(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      agentState: true,
      versions: { orderBy: { version: "desc" } },
    },
  })
}

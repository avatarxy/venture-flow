import type { Prisma } from "@prisma/client"
import { prisma } from "@/server/db/client"

export type PersistedAgentState = {
  projectId: string
  status: string
  currentPlan: Prisma.InputJsonValue
  currentStep: number
  toolCalls: Prisma.InputJsonValue
  buildAttempts: number
  repairAttempts: number
  totalTokens: number
}

export async function saveAgentState(state: PersistedAgentState) {
  return prisma.agentState.upsert({
    where: { projectId: state.projectId },
    create: {
      projectId: state.projectId,
      status: state.status,
      currentPlan: state.currentPlan,
      currentStep: state.currentStep,
      toolCalls: state.toolCalls,
      buildAttempts: state.buildAttempts,
      repairAttempts: state.repairAttempts,
      totalTokens: state.totalTokens,
    },
    update: {
      status: state.status,
      currentPlan: state.currentPlan,
      currentStep: state.currentStep,
      toolCalls: state.toolCalls,
      buildAttempts: state.buildAttempts,
      repairAttempts: state.repairAttempts,
      totalTokens: state.totalTokens,
    },
  })
}

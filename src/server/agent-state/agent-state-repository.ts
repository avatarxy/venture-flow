import { Prisma } from "@prisma/client"
import { z } from "zod"
import { agentStateSchema } from "@/server/contracts"
import { prisma } from "@/server/db/client"

const persistedAgentStateSchema = agentStateSchema

export type PersistedAgentState = z.infer<typeof persistedAgentStateSchema>

export function validateAgentStateForPersistence(state: unknown): PersistedAgentState {
  return persistedAgentStateSchema.parse(state)
}

function nullableJson(value: unknown) {
  return value === undefined ? Prisma.JsonNull : (value as Prisma.InputJsonValue)
}

export async function saveAgentState(state: unknown) {
  const parsedState = validateAgentStateForPersistence(state)

  return prisma.agentState.upsert({
    where: { projectId: parsedState.projectId },
    create: {
      projectId: parsedState.projectId,
      originalProblem: parsedState.originalProblem,
      goal: parsedState.goal,
      status: parsedState.status,
      currentPlan: parsedState.currentPlan as Prisma.InputJsonValue,
      currentStep: parsedState.currentStep,
      strategy: nullableJson(parsedState.strategy),
      blueprint: nullableJson(parsedState.blueprint),
      build: nullableJson(parsedState.build),
      review: nullableJson(parsedState.review),
      toolCalls: parsedState.toolCalls as Prisma.InputJsonValue,
      buildAttempts: parsedState.buildAttempts,
      repairAttempts: parsedState.repairAttempts,
      totalTokens: parsedState.totalTokens,
    },
    update: {
      originalProblem: parsedState.originalProblem,
      goal: parsedState.goal,
      status: parsedState.status,
      currentPlan: parsedState.currentPlan as Prisma.InputJsonValue,
      currentStep: parsedState.currentStep,
      strategy: nullableJson(parsedState.strategy),
      blueprint: nullableJson(parsedState.blueprint),
      build: nullableJson(parsedState.build),
      review: nullableJson(parsedState.review),
      toolCalls: parsedState.toolCalls as Prisma.InputJsonValue,
      buildAttempts: parsedState.buildAttempts,
      repairAttempts: parsedState.repairAttempts,
      totalTokens: parsedState.totalTokens,
    },
  })
}

export async function stopAgentState(projectId: string) {
  return prisma.agentState.update({
    where: { projectId },
    data: { status: "stopped" },
  })
}

import type { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/server/db/client"

const persistedPlanItemSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["pending", "running", "completed", "failed"]),
})

const persistedToolCallSchema = z.object({
  toolName: z.string().min(1),
  reasoningSummary: z.string(),
  argumentsSummary: z.string(),
  resultSummary: z.string().optional(),
  status: z.enum(["running", "completed", "failed"]),
  startedAt: z.string().min(1),
  endedAt: z.string().optional(),
  errorMessage: z.string().optional(),
  tokenUsage: z.number().int().nonnegative().default(0),
})

const persistedAgentStateSchema = z.object({
  projectId: z.string().min(1),
  status: z.enum(["planning", "executing", "waiting_for_user", "completed", "failed"]),
  currentPlan: z.array(persistedPlanItemSchema),
  currentStep: z.number().int().nonnegative(),
  toolCalls: z.array(persistedToolCallSchema),
  buildAttempts: z.number().int().nonnegative(),
  repairAttempts: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
})

export type PersistedAgentState = z.infer<typeof persistedAgentStateSchema>

export function validateAgentStateForPersistence(state: unknown): PersistedAgentState {
  return persistedAgentStateSchema.parse(state)
}

export async function saveAgentState(state: unknown) {
  const parsedState = validateAgentStateForPersistence(state)

  return prisma.agentState.upsert({
    where: { projectId: parsedState.projectId },
    create: {
      projectId: parsedState.projectId,
      status: parsedState.status,
      currentPlan: parsedState.currentPlan as Prisma.InputJsonValue,
      currentStep: parsedState.currentStep,
      toolCalls: parsedState.toolCalls as Prisma.InputJsonValue,
      buildAttempts: parsedState.buildAttempts,
      repairAttempts: parsedState.repairAttempts,
      totalTokens: parsedState.totalTokens,
    },
    update: {
      status: parsedState.status,
      currentPlan: parsedState.currentPlan as Prisma.InputJsonValue,
      currentStep: parsedState.currentStep,
      toolCalls: parsedState.toolCalls as Prisma.InputJsonValue,
      buildAttempts: parsedState.buildAttempts,
      repairAttempts: parsedState.repairAttempts,
      totalTokens: parsedState.totalTokens,
    },
  })
}

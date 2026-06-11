import { z } from "zod"
import { buildOutputSchema } from "./build"
import { productBlueprintSchema } from "./blueprint"
import { jsonObjectSchema } from "./json"
import { optimizationOutputSchema } from "./optimization"
import { reviewResultSchema } from "./review"
import { strategyOutputSchema } from "./strategy"
import { inspectCapabilitiesOutputSchema } from "../tools/inspect-capabilities"

export const toolNameSchema = z.enum([
  "analyze_problem",
  "inspect_capabilities",
  "create_blueprint",
  "validate_blueprint",
  "generate_application",
  "inspect_build",
  "run_preview",
  "repair_application",
  "optimize_product",
  "save_project",
  "finish_task",
])

export const agentActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("tool"),
    reasoningSummary: z.string().min(1),
    toolName: toolNameSchema,
    arguments: jsonObjectSchema,
  }),
  z.object({
    type: z.literal("finish"),
    reasoningSummary: z.string().min(1),
  }),
])

export const toolCallRecordSchema = z.object({
  toolName: toolNameSchema,
  reasoningSummary: z.string(),
  argumentsSummary: z.string(),
  resultSummary: z.string().optional(),
  status: z.enum(["running", "completed", "failed"]),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  errorMessage: z.string().optional(),
  tokenUsage: z.number().int().nonnegative().default(0),
})

export const agentPlanItemSchema = z.object({
  title: z.string(),
  status: z.enum(["pending", "running", "completed", "failed"]),
})

export const agentStateSchema = z.object({
  projectId: z.string(),
  originalProblem: z.string(),
  goal: z.string(),
  currentPlan: z.array(agentPlanItemSchema),
  currentStep: z.number().int().nonnegative(),
  strategy: strategyOutputSchema.optional(),
  blueprint: productBlueprintSchema.optional(),
  build: buildOutputSchema.optional(),
  review: reviewResultSchema.optional(),
  optimization: optimizationOutputSchema.optional(),
  capabilities: inspectCapabilitiesOutputSchema.optional(),
  toolCalls: z.array(toolCallRecordSchema),
  buildAttempts: z.number().int().nonnegative(),
  repairAttempts: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  status: z.enum(["planning", "executing", "waiting_for_user", "completed", "failed", "stopped"]),
})

export type ToolName = z.infer<typeof toolNameSchema>
export type AgentAction = z.infer<typeof agentActionSchema>
export type ToolCallRecord = z.infer<typeof toolCallRecordSchema>
export type AgentPlanItem = z.infer<typeof agentPlanItemSchema>
export type AgentState = z.infer<typeof agentStateSchema>

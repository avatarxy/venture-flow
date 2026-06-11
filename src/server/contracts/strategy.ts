import { z } from "zod"

export const appPatternSchema = z.enum([
  "dashboard",
  "crm",
  "feedback-board",
  "task-manager",
  "content-planner",
  "booking-manager",
  "survey",
  "custom-crud",
])

export const strategyOutputSchema = z.object({
  problemSummary: z.string().min(10),
  targetUsers: z.array(z.string().min(1)).min(1),
  painPoints: z.array(z.string().min(1)).min(1),
  desiredOutcomes: z.array(z.string().min(1)).min(1),
  successMetrics: z.array(z.string().min(1)).min(1),
  facts: z.array(z.string()),
  assumptions: z.array(z.string()),
  validationQuestions: z.array(z.string()),
  recommendedAppPattern: appPatternSchema,
})

export type AppPattern = z.infer<typeof appPatternSchema>
export type StrategyOutput = z.infer<typeof strategyOutputSchema>

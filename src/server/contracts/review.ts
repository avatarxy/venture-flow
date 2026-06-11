import { z } from "zod"

export const reviewIssueSchema = z.object({
  type: z.enum(["missing_file", "missing_feature", "forbidden_dependency", "compile_error", "empty_action", "persistence_missing"]),
  message: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
})

export const reviewResultSchema = z.object({
  passed: z.boolean(),
  issues: z.array(reviewIssueSchema),
  recommendedFix: z.string().optional(),
})

export type ReviewIssue = z.infer<typeof reviewIssueSchema>
export type ReviewResult = z.infer<typeof reviewResultSchema>

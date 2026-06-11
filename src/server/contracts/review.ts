import { z } from "zod"

export const reviewIssueSchema = z.object({
  type: z.enum(["missing_file", "missing_feature", "forbidden_dependency", "compile_error", "empty_action", "persistence_missing"]),
  message: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
})

export const reviewResultSchema = z
  .object({
    passed: z.boolean(),
    issues: z.array(reviewIssueSchema),
    recommendedFix: z.string().optional(),
  })
  .superRefine((result, ctx) => {
    if (result.passed && result.issues.length > 0) {
      ctx.addIssue({ code: "custom", message: "通过的 review 不能包含 issue", path: ["issues"] })
    }

    if (!result.passed && result.issues.length === 0) {
      ctx.addIssue({ code: "custom", message: "未通过的 review 必须包含至少一个 issue", path: ["issues"] })
    }
  })

export type ReviewIssue = z.infer<typeof reviewIssueSchema>
export type ReviewResult = z.infer<typeof reviewResultSchema>

import type { z } from "zod"

export function parseStructuredJson<T>(schema: z.ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw)

  if (!result.success) {
    throw new Error(
      result.error.issues
        .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
        .join("; "),
    )
  }

  return result.data
}

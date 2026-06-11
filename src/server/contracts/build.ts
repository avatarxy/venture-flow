import { z } from "zod"

export const generatedFileSchema = z.object({
  path: z.string().startsWith("/"),
  content: z.string().min(1),
})

export const buildOutputSchema = z.object({
  summary: z.string().min(1),
  files: z.array(generatedFileSchema).min(1),
})

export type GeneratedFile = z.infer<typeof generatedFileSchema>
export type BuildOutput = z.infer<typeof buildOutputSchema>

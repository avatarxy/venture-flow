import { z } from "zod"

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  AI_BASE_URL: z.string().url().default("https://generativelanguage.googleapis.com/v1beta"),
  AI_MODEL: z.string().min(1).default("gemma-4-26b-a4b-it"),
  NEXT_PUBLIC_APP_URL: z.url(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function parseServerEnv(input: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse({
    DATABASE_URL: input.DATABASE_URL,
    GEMINI_API_KEY: input.GEMINI_API_KEY,
    AI_BASE_URL: input.AI_BASE_URL,
    AI_MODEL: input.AI_MODEL,
    NEXT_PUBLIC_APP_URL: input.NEXT_PUBLIC_APP_URL,
  })
}

export function getServerEnv() {
  return parseServerEnv(process.env)
}

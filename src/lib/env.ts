import { z } from "zod"

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function parseServerEnv(input: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse({
    DATABASE_URL: input.DATABASE_URL,
    OPENAI_API_KEY: input.OPENAI_API_KEY,
    NEXT_PUBLIC_APP_URL: input.NEXT_PUBLIC_APP_URL,
  })
}

export function getServerEnv() {
  return parseServerEnv(process.env)
}

import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { getServerEnv, parseServerEnv, type ServerEnv } from "@/lib/env"

type AiModelConfig = Pick<ServerEnv, "GEMINI_API_KEY" | "AI_BASE_URL" | "AI_MODEL">

export function getAiModelConfig(input: Record<string, string | undefined>) {
  const env = parseServerEnv(input)

  return {
    apiKey: env.GEMINI_API_KEY,
    baseURL: env.AI_BASE_URL,
    model: env.AI_MODEL,
  }
}

export function createPrimaryModel(config: AiModelConfig) {
  const provider = createGoogleGenerativeAI({
    apiKey: config.GEMINI_API_KEY,
    baseURL: config.AI_BASE_URL,
  })

  return provider.chat(config.AI_MODEL)
}

export function getPrimaryModel() {
  return createPrimaryModel(getServerEnv())
}

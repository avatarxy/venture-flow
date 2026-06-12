import { describe, expect, it } from "vitest"
import { createPrimaryModel, getAiModelConfig } from "./model"

describe("getAiModelConfig", () => {
  it("uses Google Gemini as the default AI provider", () => {
    const config = getAiModelConfig({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/ventureflow",
      GEMINI_API_KEY: "test-key",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    })

    expect(config).toEqual({
      apiKey: "test-key",
      baseURL: "https://generativelanguage.googleapis.com/v1beta",
      model: "gemma-4-26b",
    })
  })

  it("creates a Google Generative AI chat model", () => {
    const model = createPrimaryModel({
      GEMINI_API_KEY: "test-key",
      AI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta",
      AI_MODEL: "gemma-4-26b",
    })

    expect(model.provider).toBe("google.generative-ai")
    expect(model.modelId).toBe("gemma-4-26b")
  })
})

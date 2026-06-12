import { describe, expect, it } from "vitest"
import { parseServerEnv } from "./env"

describe("parseServerEnv", () => {
  it("accepts required server environment variables", () => {
    const result = parseServerEnv({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/ventureflow",
      GEMINI_API_KEY: "test-key",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    })

    expect(result.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000")
    expect(result.AI_BASE_URL).toBe("https://generativelanguage.googleapis.com/v1beta")
    expect(result.AI_MODEL).toBe("gemma-4-26b")
  })

  it("accepts custom Gemini model configuration", () => {
    const result = parseServerEnv({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/ventureflow",
      GEMINI_API_KEY: "test-key",
      AI_BASE_URL: "https://my-gemini-proxy.example.com/v1beta",
      AI_MODEL: "gemini-2.5-flash",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    })

    expect(result.AI_BASE_URL).toBe("https://my-gemini-proxy.example.com/v1beta")
    expect(result.AI_MODEL).toBe("gemini-2.5-flash")
  })

  it("rejects an invalid public app URL", () => {
    expect(() =>
      parseServerEnv({
        DATABASE_URL: "postgresql://user:pass@localhost:5432/ventureflow",
        GEMINI_API_KEY: "test-key",
        NEXT_PUBLIC_APP_URL: "localhost",
      }),
    ).toThrow()
  })
})

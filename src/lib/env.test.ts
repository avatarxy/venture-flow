import { describe, expect, it } from "vitest"
import { parseServerEnv } from "./env"

describe("parseServerEnv", () => {
  it("accepts required server environment variables", () => {
    const result = parseServerEnv({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/ventureflow",
      OPENAI_API_KEY: "sk-test",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    })

    expect(result.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000")
  })

  it("rejects an invalid public app URL", () => {
    expect(() =>
      parseServerEnv({
        DATABASE_URL: "postgresql://user:pass@localhost:5432/ventureflow",
        OPENAI_API_KEY: "sk-test",
        NEXT_PUBLIC_APP_URL: "localhost",
      }),
    ).toThrow()
  })
})

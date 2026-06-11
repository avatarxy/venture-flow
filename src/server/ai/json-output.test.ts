import { describe, expect, it } from "vitest"
import { z } from "zod"
import { parseStructuredJson } from "./json-output"

describe("parseStructuredJson", () => {
  it("returns schema-validated structured output", () => {
    const result = parseStructuredJson(z.object({ title: z.string().min(1) }), { title: "Strategy" })

    expect(result.title).toBe("Strategy")
  })

  it("throws readable validation errors", () => {
    expect(() => parseStructuredJson(z.object({ title: z.string().min(3) }), { title: "" })).toThrow("Too small")
  })
})

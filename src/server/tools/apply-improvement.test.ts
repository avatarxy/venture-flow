import { describe, expect, it } from "vitest"
import { patchRequestSchema } from "./apply-improvement"

describe("patchRequestSchema", () => {
  it("accepts a bounded improvement patch request", () => {
    expect(
      patchRequestSchema.parse({
        goal: "Increase lead creation",
        recommendation: "Make the add lead CTA easier to find",
        targetFiles: ["/App.tsx"],
        constraints: ["Keep generated app in Sandpack", "Do not add network requests"],
      }),
    ).toEqual({
      goal: "Increase lead creation",
      recommendation: "Make the add lead CTA easier to find",
      targetFiles: ["/App.tsx"],
      constraints: ["Keep generated app in Sandpack", "Do not add network requests"],
    })
  })

  it("rejects target files outside generated app paths", () => {
    expect(() =>
      patchRequestSchema.parse({
        goal: "Increase lead creation",
        recommendation: "Make the add lead CTA easier to find",
        targetFiles: ["App.tsx"],
        constraints: ["Keep generated app in Sandpack"],
      }),
    ).toThrow()
  })

  it("rejects Sandpack runtime files as patch targets", () => {
    expect(() =>
      patchRequestSchema.parse({
        goal: "Increase lead creation",
        recommendation: "Change dependencies",
        targetFiles: ["/package.json"],
        constraints: ["Keep generated app in Sandpack"],
      }),
    ).toThrow("Patch request cannot target Sandpack runtime file: /package.json")
  })
})

import { describe, expect, it } from "vitest"
import { validateBlueprintCapability } from "./validate-blueprint"

describe("validateBlueprintCapability", () => {
  it("rejects unsupported large blueprint", () => {
    const result = validateBlueprintCapability({
      pagesCount: 9,
      entitiesCount: 1,
      coreFeaturesCount: 3,
    })

    expect(result.passed).toBe(false)
    expect(result.issues[0]).toContain("页面数量")
  })

  it("accepts blueprint within MVP capability bounds", () => {
    expect(validateBlueprintCapability({ pagesCount: 8, entitiesCount: 6, coreFeaturesCount: 12 })).toEqual({
      passed: true,
      issues: [],
    })
  })
})

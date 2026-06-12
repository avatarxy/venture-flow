import { describe, expect, it } from "vitest"
import { validateBlueprintCapability } from "./validate-blueprint"

describe("validateBlueprintCapability", () => {
  it("rejects unsupported large blueprint", () => {
    const result = validateBlueprintCapability({
      pagesCount: 6,
      entitiesCount: 1,
      coreFeaturesCount: 3,
    })

    expect(result.passed).toBe(false)
    expect(result.issues[0]).toContain("页面数量")
  })

  it("accepts blueprint within MVP capability bounds", () => {
    expect(validateBlueprintCapability({ pagesCount: 5, entitiesCount: 4, coreFeaturesCount: 7 })).toEqual({
      passed: true,
      issues: [],
    })
  })
})

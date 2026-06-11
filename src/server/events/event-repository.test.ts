import { describe, expect, it } from "vitest"
import { assertUsageEventAllowed, normalizeUsageMetadata } from "./event-repository"

describe("usage event repository helpers", () => {
  it("rejects unsupported usage events", () => {
    expect(() => assertUsageEventAllowed("unknown_event")).toThrow("Unsupported usage event")
  })

  it("accepts supported usage events", () => {
    expect(() => assertUsageEventAllowed("entity_created")).not.toThrow()
  })

  it("normalizes small primitive metadata records", () => {
    expect(
      normalizeUsageMetadata({
        query: "lead",
        count: 3,
        active: true,
        empty: null,
        ignored: undefined,
      }),
    ).toEqual({
      query: "lead",
      count: 3,
      active: true,
      empty: null,
    })
  })

  it("rejects nested metadata", () => {
    expect(() => normalizeUsageMetadata({ nested: { field: "value" } })).toThrow("Usage event metadata only supports primitive values")
  })

  it("rejects oversized metadata", () => {
    expect(() => normalizeUsageMetadata({ note: "x".repeat(3000) })).toThrow("Usage event metadata is too large")
  })
})

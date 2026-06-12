import { describe, expect, it } from "vitest"
import { aggregateUsageEvents } from "./analytics-service"

describe("aggregateUsageEvents", () => {
  it("counts key events", () => {
    const summary = aggregateUsageEvents([
      { eventName: "app_opened" },
      { eventName: "entity_created" },
      { eventName: "entity_created" },
      { eventName: "search_used" },
    ])

    expect(summary.totalVisits).toBe(1)
    expect(summary.activeActions).toBe(3)
    expect(summary.createdRecords).toBe(2)
    expect(summary.statusChanges).toBe(0)
    expect(summary.searchAndFilterUses).toBe(1)
  })

  it("identifies the most used core action", () => {
    const summary = aggregateUsageEvents([
      { eventName: "entity_updated" },
      { eventName: "entity_updated" },
      { eventName: "filter_used" },
    ])

    expect(summary.topAction).toEqual({ eventName: "entity_updated", count: 2 })
  })

  it("returns null top action when there are no active actions", () => {
    const summary = aggregateUsageEvents([{ eventName: "app_opened" }])

    expect(summary.topAction).toBeNull()
  })
})

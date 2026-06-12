import { afterEach, describe, expect, it } from "vitest"
import { getChatMessages } from "./message-repository"

describe("message repository demo fallback", () => {
  afterEach(() => {
    delete process.env.VENTUREFLOW_ENABLE_DEMO_PROJECT
  })

  it("returns empty demo project messages without database access when explicitly enabled", async () => {
    process.env.VENTUREFLOW_ENABLE_DEMO_PROJECT = "1"

    await expect(getChatMessages("demo-project")).resolves.toEqual([])
  })
})

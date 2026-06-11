import { describe, expect, it, vi } from "vitest"
import { logSystemEvent } from "./logger"

describe("logSystemEvent", () => {
  it("writes structured system events to the matching console level", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined)

    logSystemEvent("info", "foundation.ready", { module: "foundation" })

    expect(spy).toHaveBeenCalledTimes(1)
    const [message] = spy.mock.calls[0] ?? []
    const payload = JSON.parse(String(message)) as {
      level: string
      eventName: string
      metadata: { module: string }
      createdAt: string
    }
    expect(payload).toMatchObject({
      level: "info",
      eventName: "foundation.ready",
      metadata: { module: "foundation" },
    })
    expect(new Date(payload.createdAt).toString()).not.toBe("Invalid Date")
  })
})

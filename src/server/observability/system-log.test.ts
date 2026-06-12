import { describe, expect, it, vi } from "vitest"
import { writeSystemLog } from "./system-log"

describe("writeSystemLog", () => {
  it("writes structured system logs to the matching console level", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    writeSystemLog({
      level: "warn",
      eventName: "agent.tool.failed",
      projectId: "project_1",
      message: "Tool call failed",
      metadata: { toolName: "generate_application" },
    })

    expect(spy).toHaveBeenCalledTimes(1)
    const [message] = spy.mock.calls[0] ?? []
    const payload = JSON.parse(String(message)) as {
      level: string
      eventName: string
      projectId: string
      message: string
      metadata: { toolName: string }
      createdAt: string
    }

    expect(payload).toMatchObject({
      level: "warn",
      eventName: "agent.tool.failed",
      projectId: "project_1",
      message: "Tool call failed",
      metadata: { toolName: "generate_application" },
    })
    expect(new Date(payload.createdAt).toString()).not.toBe("Invalid Date")
  })
})

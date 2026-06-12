import { beforeEach, describe, expect, it, vi } from "vitest"
import { POST } from "./route"
import { recordUsageEvent } from "@/server/events/event-repository"

vi.mock("@/server/events/event-repository", () => ({
  recordUsageEvent: vi.fn(),
}))

const mockedRecordUsageEvent = vi.mocked(recordUsageEvent)

function jsonRequest(body: unknown) {
  return new Request("http://test.local/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("usage events route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects malformed JSON before recording events", async () => {
    const response = await POST(
      new Request("http://test.local/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    )

    expect(response.status).toBe(400)
    expect(mockedRecordUsageEvent).not.toHaveBeenCalled()
    expect(await response.json()).toEqual({ error: "请求体必须是有效 JSON" })
  })

  it("rejects incomplete event payloads", async () => {
    const response = await POST(jsonRequest({ projectId: "project_1", eventName: "app_opened" }))

    expect(response.status).toBe(400)
    expect(mockedRecordUsageEvent).not.toHaveBeenCalled()
    expect(await response.json()).toEqual({ error: "Usage event payload is invalid" })
  })

  it("records a valid usage event", async () => {
    mockedRecordUsageEvent.mockResolvedValueOnce({
      id: "event_1",
      projectId: "project_1",
      versionId: "version_1",
      eventName: "entity_created",
    } as never)

    const response = await POST(
      jsonRequest({
        projectId: "project_1",
        versionId: "version_1",
        eventName: "entity_created",
        entityName: "Lead",
        metadata: { source: "preview" },
      }),
    )

    expect(response.status).toBe(200)
    expect(mockedRecordUsageEvent).toHaveBeenCalledWith({
      projectId: "project_1",
      versionId: "version_1",
      eventName: "entity_created",
      entityName: "Lead",
      metadata: { source: "preview" },
    })
    expect(await response.json()).toEqual({
      event: {
        id: "event_1",
        projectId: "project_1",
        versionId: "version_1",
        eventName: "entity_created",
      },
    })
  })

  it("maps repository validation failures to bad requests", async () => {
    mockedRecordUsageEvent.mockRejectedValueOnce(new Error("Unsupported usage event: unknown"))

    const response = await POST(
      jsonRequest({
        projectId: "project_1",
        versionId: "version_1",
        eventName: "unknown",
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Unsupported usage event: unknown" })
  })

  it("maps project and version ownership failures to bad requests", async () => {
    mockedRecordUsageEvent.mockRejectedValueOnce(new Error("Usage event version does not belong to project"))

    const response = await POST(
      jsonRequest({
        projectId: "project_1",
        versionId: "version_from_another_project",
        eventName: "app_opened",
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Usage event version does not belong to project" })
  })
})

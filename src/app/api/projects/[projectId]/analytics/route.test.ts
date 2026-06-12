import { beforeEach, describe, expect, it, vi } from "vitest"
import { GET } from "./route"
import { prisma } from "@/server/db/client"

vi.mock("@/server/db/client", () => ({
  prisma: {
    usageEvent: {
      findMany: vi.fn(),
    },
  },
}))

const mockedFindMany = vi.mocked(prisma.usageEvent.findMany)
const context = { params: Promise.resolve({ projectId: "project_1" }) }
const request = new Request("http://test.local/api/projects/project_1/analytics")

describe("analytics route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns aggregated usage event metrics for a project", async () => {
    mockedFindMany.mockResolvedValueOnce([
      { id: "event_1", eventName: "app_opened", createdAt: new Date("2026-06-12T00:00:00.000Z") },
      { id: "event_2", eventName: "entity_created", createdAt: new Date("2026-06-12T00:01:00.000Z") },
      { id: "event_3", eventName: "search_used", createdAt: new Date("2026-06-12T00:02:00.000Z") },
    ] as never)

    const response = await GET(request, context)

    expect(response.status).toBe(200)
    expect(mockedFindMany).toHaveBeenCalledWith({
      where: { projectId: "project_1" },
      orderBy: { createdAt: "desc" },
      take: 500,
    })
    expect(await response.json()).toMatchObject({
      summary: {
        totalVisits: 1,
        activeActions: 2,
        createdRecords: 1,
        searchAndFilterUses: 1,
      },
      events: [
        { id: "event_1", eventName: "app_opened", createdAt: "2026-06-12T00:00:00.000Z" },
        { id: "event_2", eventName: "entity_created", createdAt: "2026-06-12T00:01:00.000Z" },
        { id: "event_3", eventName: "search_used", createdAt: "2026-06-12T00:02:00.000Z" },
      ],
    })
  })
})

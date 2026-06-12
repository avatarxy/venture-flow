import { beforeEach, describe, expect, it, vi } from "vitest"
import { assertUsageEventAllowed, normalizeUsageMetadata, recordUsageEvent } from "./event-repository"

const mocks = vi.hoisted(() => ({
  prisma: {
    generatedVersion: {
      findFirst: vi.fn(),
    },
    usageEvent: {
      create: vi.fn(),
    },
  },
}))

vi.mock("@/server/db/client", () => ({
  prisma: mocks.prisma,
}))

describe("usage event repository helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it("rejects events when the version does not belong to the project", async () => {
    mocks.prisma.generatedVersion.findFirst.mockResolvedValueOnce(null)

    await expect(
      recordUsageEvent({
        projectId: "project_1",
        versionId: "version_from_another_project",
        eventName: "app_opened",
      }),
    ).rejects.toThrow("Usage event version does not belong to project")
    expect(mocks.prisma.usageEvent.create).not.toHaveBeenCalled()
  })

  it("records events only after validating project and version ownership", async () => {
    mocks.prisma.generatedVersion.findFirst.mockResolvedValueOnce({ id: "version_1" })
    mocks.prisma.usageEvent.create.mockResolvedValueOnce({ id: "event_1" })

    await expect(
      recordUsageEvent({
        projectId: "project_1",
        versionId: "version_1",
        eventName: "app_opened",
      }),
    ).resolves.toEqual({ id: "event_1" })
    expect(mocks.prisma.generatedVersion.findFirst).toHaveBeenCalledWith({
      where: { id: "version_1", projectId: "project_1" },
      select: { id: true },
    })
  })
})

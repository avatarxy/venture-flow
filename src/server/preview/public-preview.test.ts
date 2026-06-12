import { beforeEach, describe, expect, it, vi } from "vitest"
import { getPublicPreviewVersion } from "./public-preview"
import { prisma } from "@/server/db/client"

vi.mock("@/server/db/client", () => ({
  prisma: {
    generatedVersion: {
      findFirst: vi.fn(),
    },
  },
}))

const mockedFindFirst = vi.mocked(prisma.generatedVersion.findFirst)

describe("getPublicPreviewVersion", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("loads a generated version by project and version id", async () => {
    mockedFindFirst.mockResolvedValueOnce({
      id: "version_1",
      projectId: "project_1",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
    } as never)

    await expect(getPublicPreviewVersion({ projectId: "project_1", versionId: "version_1" })).resolves.toEqual({
      id: "version_1",
      projectId: "project_1",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
    })
    expect(mockedFindFirst).toHaveBeenCalledWith({
      where: { id: "version_1", projectId: "project_1", publishStatus: "LIVE" },
      select: { id: true, projectId: true, files: true },
    })
  })

  it("returns null when persisted files do not match the generated file schema", async () => {
    mockedFindFirst.mockResolvedValueOnce({
      id: "version_1",
      projectId: "project_1",
      files: [{ path: "App.tsx", content: "" }],
    } as never)

    await expect(getPublicPreviewVersion({ projectId: "project_1", versionId: "version_1" })).resolves.toBeNull()
  })
})

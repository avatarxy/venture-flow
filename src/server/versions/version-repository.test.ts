import { beforeEach, describe, expect, it, vi } from "vitest"
import { createGeneratedVersion } from "./version-repository"

const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
  },
  tx: {
    generatedVersion: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    project: {
      update: vi.fn(),
    },
  },
}))

vi.mock("@/server/db/client", () => ({
  prisma: mocks.prisma,
}))

describe("createGeneratedVersion", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.prisma.$transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => Promise<unknown>) => callback(mocks.tx))
    mocks.tx.generatedVersion.findFirst.mockResolvedValue(null)
    mocks.tx.generatedVersion.create.mockResolvedValue({
      id: "version_1",
      projectId: "project_1",
      version: 1,
    })
    mocks.tx.project.update.mockResolvedValue({
      id: "project_1",
      currentVersionId: "version_1",
    })
  })

  it("creates the next version and updates the project current version in one transaction", async () => {
    mocks.tx.generatedVersion.findFirst.mockResolvedValue({ version: 2 })
    mocks.tx.generatedVersion.create.mockResolvedValue({
      id: "version_3",
      projectId: "project_1",
      version: 3,
    })

    const result = await createGeneratedVersion({
      projectId: "project_1",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
      blueprintSnapshot: { productName: "Sales CRM" },
      changeSummary: "Initial version",
    })

    expect(result).toMatchObject({ id: "version_3", version: 3 })
    expect(mocks.tx.generatedVersion.create).toHaveBeenCalledWith({
      data: {
        projectId: "project_1",
        version: 3,
        files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
        blueprintSnapshot: { productName: "Sales CRM" },
        changeSummary: "Initial version",
      },
    })
    expect(mocks.tx.project.update).toHaveBeenCalledWith({
      where: { id: "project_1" },
      data: { currentVersionId: "version_3" },
    })
  })

  it("retries version creation after a concurrent unique-version conflict", async () => {
    mocks.prisma.$transaction
      .mockRejectedValueOnce({ code: "P2002" })
      .mockImplementationOnce(async (callback: (tx: typeof mocks.tx) => Promise<unknown>) => callback(mocks.tx))

    const result = await createGeneratedVersion({
      projectId: "project_1",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
      blueprintSnapshot: { productName: "Sales CRM" },
      changeSummary: "Retry version",
    })

    expect(result).toMatchObject({ id: "version_1", version: 1 })
    expect(mocks.prisma.$transaction).toHaveBeenCalledTimes(2)
  })
})

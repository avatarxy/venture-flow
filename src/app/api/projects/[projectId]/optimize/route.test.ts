import { beforeEach, describe, expect, it, vi } from "vitest"
import { POST } from "./route"
import { prisma } from "@/server/db/client"
import { optimizeProduct } from "@/server/tools/optimize-product"

vi.mock("@/server/db/client", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
    },
    usageEvent: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock("@/server/tools/optimize-product", () => ({
  optimizeProduct: vi.fn(),
}))

const mockedFindUnique = vi.mocked(prisma.project.findUnique)
const mockedFindMany = vi.mocked(prisma.usageEvent.findMany)
const mockedOptimizeProduct = vi.mocked(optimizeProduct)
const context = { params: Promise.resolve({ projectId: "project_1" }) }
const request = new Request("http://test.local/api/projects/project_1/optimize", { method: "POST" })

const blueprint = {
  productName: "Sales CRM",
  description: "A lightweight CRM for sales teams to capture and follow up leads.",
  problemSummary: "Sales team loses leads.",
  targetUsers: ["Sales rep"],
  goals: ["Capture every lead"],
  successMetrics: ["Created leads"],
  appPattern: "crm",
  entities: [
    {
      name: "Lead",
      label: "Lead",
      description: "Sales lead",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "status", label: "Status", type: "status", required: true },
      ],
    },
  ],
  pages: [
    {
      id: "leads",
      name: "Leads",
      route: "/leads",
      purpose: "Manage sales leads and follow-up status",
      components: [{ type: "table", title: "Lead table", entityName: "Lead" }],
    },
    {
      id: "dashboard",
      name: "Dashboard",
      route: "/dashboard",
      purpose: "Review lead pipeline performance",
      components: [{ type: "dashboard", title: "Pipeline dashboard", entityName: "Lead" }],
    },
  ],
  workflows: [{ title: "Lead follow-up", steps: ["Create lead", "Update status"] }],
  decisions: [
    {
      title: "Use CRM pattern",
      decision: "Build a lightweight CRM",
      reason: "The team needs lead tracking",
      tradeoff: "Less workflow automation in MVP",
    },
  ],
  seedData: { Lead: [{ name: "Acme", status: "New" }] },
}

describe("optimize route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns an insufficient data response when no usage events exist", async () => {
    mockedFindUnique.mockResolvedValueOnce({ id: "project_1", blueprint } as never)
    mockedFindMany.mockResolvedValueOnce([])

    const response = await POST(request, context)

    expect(response.status).toBe(200)
    expect(mockedOptimizeProduct).not.toHaveBeenCalled()
    expect(await response.json()).toEqual({
      findings: [],
      recommendations: [],
      message: "当前真实使用数据不足，无法生成可靠优化建议。",
    })
  })

  it("runs the Growth Agent with validated blueprint and real usage events", async () => {
    mockedFindUnique.mockResolvedValueOnce({ id: "project_1", blueprint } as never)
    mockedFindMany.mockResolvedValueOnce([
      {
        id: "event_1",
        eventName: "app_opened",
        entityName: null,
        metadata: { source: "preview" },
        createdAt: new Date("2026-06-12T00:00:00.000Z"),
      },
    ] as never)
    mockedOptimizeProduct.mockResolvedValueOnce({
      findings: [{ title: "Visitors opened the app", evidence: ["1 app_opened event"], inference: "Initial usage exists" }],
      recommendations: [
        {
          title: "Improve lead creation",
          description: "Make the primary action clearer.",
          priority: "medium",
          evidence: ["1 app_opened event"],
          inference: "Users may need a clearer path.",
          expectedImpact: "More created leads",
          targetComponents: ["Leads"],
        },
      ],
    })

    const response = await POST(request, context)

    expect(response.status).toBe(200)
    expect(mockedOptimizeProduct).toHaveBeenCalledWith({
      blueprint,
      usageEvents: [
        {
          id: "event_1",
          eventName: "app_opened",
          entityName: null,
          metadata: { source: "preview" },
          createdAt: "2026-06-12T00:00:00.000Z",
        },
      ],
    })
    expect(await response.json()).toMatchObject({
      findings: [{ title: "Visitors opened the app" }],
      recommendations: [{ title: "Improve lead creation" }],
    })
  })

  it("returns 404 when the project does not exist", async () => {
    mockedFindUnique.mockResolvedValueOnce(null)

    const response = await POST(request, context)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: "Project not found" })
  })
})

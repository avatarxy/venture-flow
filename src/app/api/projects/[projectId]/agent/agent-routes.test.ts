import { describe, expect, it, vi } from "vitest"
import { GET as getState } from "./state/route"
import { POST as runAgent } from "./run/route"
import { POST as stopAgent } from "./stop/route"
import { getProject } from "@/server/projects/project-repository"

vi.mock("@/server/projects/project-repository", () => ({
  getProject: vi.fn(),
}))

const mockedGetProject = vi.mocked(getProject)
const context = { params: Promise.resolve({ projectId: "project_1" }) }
const request = new Request("http://test.local")

describe("agent routes", () => {
  it("rejects run requests for missing projects", async () => {
    mockedGetProject.mockResolvedValueOnce(null)

    const response = await runAgent(request, context)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: "Project not found" })
  })

  it("accepts run requests for existing projects", async () => {
    mockedGetProject.mockResolvedValueOnce({ id: "project_1" } as never)

    const response = await runAgent(request, context)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ projectId: "project_1", status: "accepted" })
  })

  it("returns the persisted agent state", async () => {
    mockedGetProject.mockResolvedValueOnce({ id: "project_1", agentState: { status: "planning" } } as never)

    const response = await getState(request, context)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ agentState: { status: "planning" } })
  })

  it("rejects stop requests for missing projects", async () => {
    mockedGetProject.mockResolvedValueOnce(null)

    const response = await stopAgent(request, context)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: "Project not found" })
  })
})

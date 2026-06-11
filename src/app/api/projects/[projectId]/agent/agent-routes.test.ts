import { beforeEach, describe, expect, it, vi } from "vitest"
import { GET as getState } from "./state/route"
import { POST as runAgent } from "./run/route"
import { POST as stopAgent } from "./stop/route"
import { getProject } from "@/server/projects/project-repository"
import { saveAgentState, stopAgentState } from "@/server/agent-state/agent-state-repository"

vi.mock("@/server/projects/project-repository", () => ({
  getProject: vi.fn(),
}))

vi.mock("@/server/agent-state/agent-state-repository", () => ({
  saveAgentState: vi.fn(),
  stopAgentState: vi.fn(),
}))

const mockedGetProject = vi.mocked(getProject)
const mockedSaveAgentState = vi.mocked(saveAgentState)
const mockedStopAgentState = vi.mocked(stopAgentState)
const context = { params: Promise.resolve({ projectId: "project_1" }) }
const request = new Request("http://test.local")

describe("agent routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects run requests for missing projects", async () => {
    mockedGetProject.mockResolvedValueOnce(null)

    const response = await runAgent(request, context)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: "Project not found" })
  })

  it("initializes and persists agent state for existing projects", async () => {
    mockedGetProject.mockResolvedValueOnce({
      id: "project_1",
      originalProblem: "销售线索很多，但团队经常忘记跟进",
      agentState: null,
    } as never)
    mockedSaveAgentState.mockResolvedValueOnce({ status: "planning" } as never)

    const response = await runAgent(request, context)

    expect(response.status).toBe(200)
    expect(mockedSaveAgentState).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "project_1",
        originalProblem: "销售线索很多，但团队经常忘记跟进",
        status: "planning",
      }),
    )
    expect(await response.json()).toEqual({ projectId: "project_1", status: "accepted", agentStateStatus: "planning" })
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

  it("marks existing agent runs as stopped", async () => {
    mockedGetProject.mockResolvedValueOnce({ id: "project_1", agentState: { status: "executing" } } as never)
    mockedStopAgentState.mockResolvedValueOnce({ status: "stopped" } as never)

    const response = await stopAgent(request, context)

    expect(response.status).toBe(200)
    expect(mockedStopAgentState).toHaveBeenCalledWith("project_1")
    expect(await response.json()).toEqual({ projectId: "project_1", status: "stopped" })
  })

  it("creates a stopped state when stopping a project without agent state", async () => {
    mockedGetProject.mockResolvedValueOnce({
      id: "project_1",
      originalProblem: "销售线索很多，但团队经常忘记跟进",
      agentState: null,
    } as never)
    mockedSaveAgentState.mockResolvedValueOnce({ status: "stopped" } as never)

    const response = await stopAgent(request, context)

    expect(response.status).toBe(200)
    expect(mockedSaveAgentState).toHaveBeenCalledWith(expect.objectContaining({ projectId: "project_1", status: "stopped" }))
    expect(await response.json()).toEqual({ projectId: "project_1", status: "stopped" })
  })
})

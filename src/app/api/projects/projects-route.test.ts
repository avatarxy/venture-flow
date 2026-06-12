import { beforeEach, describe, expect, it, vi } from "vitest"
import { POST } from "./route"
import { createProject } from "@/server/projects/project-repository"

vi.mock("@/server/projects/project-repository", () => ({
  createProject: vi.fn(),
}))

const mockedCreateProject = vi.mocked(createProject)

function jsonRequest(body: unknown) {
  return new Request("http://test.local/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("projects route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects short project problems before creating a project", async () => {
    const response = await POST(jsonRequest({ originalProblem: "太短" }))

    expect(response.status).toBe(400)
    expect(mockedCreateProject).not.toHaveBeenCalled()
    expect(await response.json()).toEqual({ error: "业务问题至少需要 20 个字符" })
  })

  it("creates a project from a business problem", async () => {
    mockedCreateProject.mockResolvedValueOnce({
      id: "project_1",
      name: "销售团队线索管理",
      originalProblem: "销售团队使用 Excel 管理客户和线索，经常忘记跟进，需要一个轻量 CRM",
      status: "DRAFT",
    } as never)

    const response = await POST(
      jsonRequest({
        originalProblem: " 销售团队使用 Excel 管理客户和线索，经常忘记跟进，需要一个轻量 CRM ",
      }),
    )

    expect(response.status).toBe(200)
    expect(mockedCreateProject).toHaveBeenCalledWith("销售团队使用 Excel 管理客户和线索，经常忘记跟进，需要一个轻量 CRM")
    expect(await response.json()).toEqual({
      project: {
        id: "project_1",
        name: "销售团队线索管理",
        originalProblem: "销售团队使用 Excel 管理客户和线索，经常忘记跟进，需要一个轻量 CRM",
        status: "DRAFT",
      },
    })
  })
})

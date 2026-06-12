import { afterEach, describe, expect, it } from "vitest"
import { createProjectName, getProject, validateProblemInput } from "./project-repository"

describe("project repository helpers", () => {
  afterEach(() => {
    delete process.env.VENTUREFLOW_ENABLE_DEMO_PROJECT
  })

  it("rejects short business problems", () => {
    expect(() => validateProblemInput("太短")).toThrow("业务问题至少需要 20 个字符")
  })

  it("creates a readable sales project name", () => {
    expect(createProjectName("我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进")).toBe("销售团队线索管理")
  })

  it("creates fallback names for unsupported patterns", () => {
    expect(createProjectName("我们需要改善跨部门审批流程，减少重复录入和状态不透明")).toBe("业务问题解决方案")
  })

  it("returns a demo project without database access when explicitly enabled", async () => {
    process.env.VENTUREFLOW_ENABLE_DEMO_PROJECT = "1"

    await expect(getProject("demo-project")).resolves.toMatchObject({
      id: "demo-project",
      name: "销售团队线索管理",
      originalProblem: "我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。",
      agentState: null,
      versions: [],
    })
  })
})

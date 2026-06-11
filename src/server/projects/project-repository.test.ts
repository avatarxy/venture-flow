import { describe, expect, it } from "vitest"
import { createProjectName, validateProblemInput } from "./project-repository"

describe("project repository helpers", () => {
  it("rejects short business problems", () => {
    expect(() => validateProblemInput("太短")).toThrow("业务问题至少需要 20 个字符")
  })

  it("creates a readable sales project name", () => {
    expect(createProjectName("我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进")).toBe("销售团队线索管理")
  })

  it("creates fallback names for unsupported patterns", () => {
    expect(createProjectName("我们需要改善跨部门审批流程，减少重复录入和状态不透明")).toBe("业务问题解决方案")
  })
})

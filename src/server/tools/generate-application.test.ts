import { describe, expect, it, vi } from "vitest"
import { validBlueprint } from "@/server/agent/agent-fixtures"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { generateApplication } from "./generate-application"

vi.mock("@/server/ai/generate-structured", () => ({
  generateStructuredObject: vi.fn(),
}))

const mockedGenerateStructuredObject = vi.mocked(generateStructuredObject)

describe("generateApplication", () => {
  it("uses the app builder prompt and build output schema", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成销售管理应用",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
    })

    const result = await generateApplication(validBlueprint)

    expect(result.files[0]?.path).toBe("/App.tsx")
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("必须包含 /App.tsx"),
        prompt: expect.stringContaining("销售管理"),
      }),
    )
  })

  it("throws when generated build is missing /App.tsx", async () => {
    // 模拟 LLM 返回了没有 /App.tsx 的结果
    // 虽然 buildOutputSchema 的 superRefine 会拦截，但此测试验证业务守卫层
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成应用",
      files: [{ path: "/index.tsx", content: "export default function Index() { return null }" }],
    })

    await expect(generateApplication(validBlueprint)).rejects.toThrow("生成结果缺少 /App.tsx 入口文件")
  })

  it("includes safety constraints in the prompt", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成销售管理应用",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
    })

    await generateApplication(validBlueprint)

    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("vf-generated-"),
      }),
    )
  })
})

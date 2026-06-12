import { describe, expect, it, vi } from "vitest"
import { validBlueprint } from "@/server/agent/agent-fixtures"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { regeneratePage } from "./regenerate-page"

vi.mock("@/server/ai/generate-structured", () => ({
  generateStructuredObject: vi.fn(),
}))

const mockedGenerateStructuredObject = vi.mocked(generateStructuredObject)

describe("regeneratePage", () => {
  it("passes full existing file contents to the model and sanitizes the result", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "页面已更新",
      files: [{ path: "/App.tsx", content: "\u0000export default function App() { return <main>changed</main> }" }],
    })

    const result = await regeneratePage({
      blueprint: validBlueprint,
      build: {
        summary: "current",
        files: [{ path: "/App.tsx", content: "export default function App() { return <main>current</main> }" }],
      },
      targetPage: "客户详情页面",
      instruction: "新增客户详情页面",
    })

    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("export default function App()"),
      }),
    )
    expect(result.files[0]?.content).not.toContain("\u0000")
    expect(result.files[0]?.content).toContain("\n  return <main>changed</main>;")
  })
})

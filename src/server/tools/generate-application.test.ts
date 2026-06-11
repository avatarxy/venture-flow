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
})

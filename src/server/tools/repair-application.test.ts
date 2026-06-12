import { describe, expect, it, vi } from "vitest"
import { validBlueprint } from "@/server/agent/agent-fixtures"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { repairApplication } from "./repair-application"

vi.mock("@/server/ai/generate-structured", () => ({
  generateStructuredObject: vi.fn(),
}))

const mockedGenerateStructuredObject = vi.mocked(generateStructuredObject)

describe("repairApplication", () => {
  it("removes invisible control characters from repaired files", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "应用已修复",
      files: [{ path: "/App.tsx", content: "\u0000export default function App() { return null }\u0000" }],
    })

    const result = await repairApplication({
      blueprint: validBlueprint,
      build: { summary: "broken", files: [{ path: "/App.tsx", content: "broken" }] },
      review: {
        passed: false,
        issues: [{ type: "compile_error", message: "Unknown character: 0", severity: "high" }],
        recommendedFix: "移除非法字符",
      },
    })

    expect(result.files[0]?.content).not.toContain("\u0000")
    expect(result.files[0]?.content).toContain("\n  return null;")
  })
})

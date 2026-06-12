import { describe, expect, it } from "vitest"
import { canFinish } from "./can-finish"
import { passingReview, validBlueprint, validStrategy } from "./agent-fixtures"

describe("canFinish", () => {
  it("rejects state without review pass", () => {
    expect(
      canFinish({
        strategy: validStrategy,
        blueprint: validBlueprint,
        build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
        review: { passed: false, issues: [{ type: "missing_feature", message: "缺少交互", severity: "high" }] },
      }),
    ).toBe(false)
  })

  it("rejects state with invalid structured outputs", () => {
    expect(
      canFinish({
        strategy: {} as never,
        blueprint: validBlueprint,
        build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
        review: passingReview,
      }),
    ).toBe(false)
  })

  it("accepts state with required validated outputs", () => {
    expect(
      canFinish({
        strategy: validStrategy,
        blueprint: validBlueprint,
        build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
        review: passingReview,
      }),
    ).toBe(true)
  })
})

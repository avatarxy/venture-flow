import { describe, expect, it, vi } from "vitest"
import { parseUserIntent } from "./user-intent"

vi.mock("@/server/ai/generate-structured", () => ({
  generateStructuredObject: vi.fn(async () => {
    throw new Error("LLM unavailable")
  }),
}))

describe("parseUserIntent", () => {
  it("deterministically recognizes continue commands without an LLM roundtrip", async () => {
    await expect(parseUserIntent("继续")).resolves.toMatchObject({
      type: "continue",
      confidence: 1,
    })

    await expect(parseUserIntent("生成 Blueprint")).resolves.toMatchObject({
      type: "continue",
      confidence: 1,
    })
  })

  it("deterministically recognizes accept commands without an LLM roundtrip", async () => {
    await expect(parseUserIntent("确认，就这样完成。")).resolves.toMatchObject({
      type: "accept",
      confidence: 1,
    })
  })

  it("routes pasted application errors to repair_application when a build exists", async () => {
    await expect(
      parseUserIntent(
        "## Error Type\nConsole Error\n\n## Error Message\nSomething went wrong\nUnknown character: 0",
        { hasBuild: true },
      ),
    ).resolves.toMatchObject({
      type: "repair_application",
      confidence: 0.95,
    })
  })

  it("routes the review fix button text to repair_application when review failed", async () => {
    await expect(
      parseUserIntent("请修复 Review 中发现的问题并重新生成。", {
        hasBuild: true,
        hasReview: true,
        reviewPassed: false,
      }),
    ).resolves.toMatchObject({
      type: "repair_application",
      instruction: "请修复 Review 中发现的问题并重新生成。",
      confidence: 0.95,
    })
  })

  it("routes generated app feature and copy changes to regenerate_page when a build exists", async () => {
    await expect(parseUserIntent("新增一个客户详情页面", { hasBuild: true })).resolves.toMatchObject({
      type: "regenerate_page",
      targetPage: "客户详情页面",
      confidence: 0.9,
    })

    await expect(parseUserIntent("把新增按钮文案改成新增客户", { hasBuild: true })).resolves.toMatchObject({
      type: "regenerate_page",
      targetPage: "客户页面",
      confidence: 0.9,
    })
  })
})

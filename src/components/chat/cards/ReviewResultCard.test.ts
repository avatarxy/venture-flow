import { describe, expect, it } from "vitest"
import { createReviewIssueItems } from "./ReviewResultCard"

describe("createReviewIssueItems", () => {
  it("creates stable unique keys when review messages repeat", () => {
    const items = createReviewIssueItems({
      passed: false,
      issues: [
        { message: "禁止使用依赖 react-router-dom" },
        { message: "禁止使用依赖 react-router-dom" },
      ],
    })

    expect(items.map((item) => item.message)).toEqual([
      "禁止使用依赖 react-router-dom",
      "禁止使用依赖 react-router-dom",
    ])
    expect(new Set(items.map((item) => item.key)).size).toBe(items.length)
  })
})

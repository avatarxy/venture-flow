import { describe, expect, it } from "vitest"
import { demoInputs } from "./demo-inputs"

describe("demoInputs", () => {
  it("contains stable demo scenarios with long enough business problems", () => {
    expect(demoInputs).toHaveLength(3)
    expect(demoInputs.map((input) => input.expectedPattern)).toEqual(["crm", "feedback-board", "content-planner"])
    expect(demoInputs.every((input) => input.problem.length >= 20)).toBe(true)
  })
})

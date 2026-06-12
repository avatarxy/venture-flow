import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  agentConstructor: vi.fn(),
  model: { provider: "agnes", modelId: "agnes-2.0-flash" },
}))

vi.mock("@mastra/core/agent", () => ({
  Agent: class {
    constructor(options: unknown) {
      mocks.agentConstructor(options)
    }
  },
}))

vi.mock("@/server/ai/model", () => ({
  getPrimaryModel: vi.fn(() => mocks.model),
}))

describe("supervisorAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("uses the shared OpenAI-compatible model configuration", async () => {
    await import("./supervisor-agent")

    expect(mocks.agentConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        model: mocks.model,
      }),
    )
  })
})

import { beforeEach, describe, expect, it, vi } from "vitest"
import { createInitialAgentState } from "./state-factory"
import { createToolRegistry } from "./tool-registry"
import { handleUserMessage } from "./supervisor"
import { passingReview, validBlueprint, validStrategy } from "./agent-fixtures"
import { parseUserIntent } from "./user-intent"

vi.mock("@/server/messages/message-repository", () => ({
  saveChatMessage: vi.fn(),
}))

vi.mock("./user-intent", () => ({
  parseUserIntent: vi.fn(),
}))

const mockedParseUserIntent = vi.mocked(parseUserIntent)

function createFastToolRegistry() {
  return createToolRegistry([
    {
      name: "analyze_problem",
      execute: async () => ({ summary: "完成业务问题分析", statePatch: { strategy: validStrategy } }),
    },
    {
      name: "inspect_capabilities",
      execute: async () => ({ summary: "完成能力边界检查", statePatch: { capabilities: {
        appPatterns: ["crm"],
        maxPages: 5,
        maxEntities: 4,
        maxCoreFeatures: 7,
        allowedDependencies: ["react"],
        unsupported: [],
      } } }),
    },
    {
      name: "create_blueprint",
      execute: async () => ({ summary: "完成产品蓝图生成", statePatch: { blueprint: validBlueprint } }),
    },
    {
      name: "validate_blueprint",
      execute: async () => ({ summary: "Blueprint 校验通过", statePatch: {} }),
    },
    {
      name: "generate_application",
      execute: async () => ({
        summary: "完成应用生成",
        statePatch: { build: { summary: "ok", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] } },
      }),
    },
    {
      name: "inspect_build",
      execute: async () => ({ summary: "应用审查通过", statePatch: { review: passingReview } }),
    },
  ])
}

describe("handleUserMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a visible execution transcript for an autonomous pipeline turn", async () => {
    const initial = createInitialAgentState("project_1", "销售团队在用 Excel 管理客户，经常漏跟线索")
    const savedStates: string[] = []

    const response = await handleUserMessage(
      "project_1",
      initial.originalProblem,
      async () => initial,
      async (state) => {
        savedStates.push(state.status)
      },
      async () => ({ type: "finish", reasoningSummary: "unused" }),
      createFastToolRegistry(),
    )

    expect(response.status).toBe("completed")
    expect(response.messages.length).toBeGreaterThan(6)
    expect(response.messages[0]).toMatchObject({ type: "agent-thinking" })
    expect(response.messages.map((message) => message.type)).toEqual(expect.arrayContaining(["agent-strategy", "agent-blueprint", "agent-build", "agent-review"]))
    expect(response.message.type).toBe("system-info")
    expect(savedStates.at(-1)).toBe("completed")
  })

  it("fills missing prerequisites instead of jumping to build without a blueprint", async () => {
    mockedParseUserIntent.mockResolvedValueOnce({ type: "skip_to_build", confidence: 0.9 })
    const initial = {
      ...createInitialAgentState("project_1", "销售团队在用 Excel 管理客户，经常漏跟线索"),
      status: "waiting_for_user" as const,
      strategy: validStrategy,
      capabilities: {
        appPatterns: ["crm"],
        maxPages: 5,
        maxEntities: 4,
        maxCoreFeatures: 7,
        allowedDependencies: ["react"],
        unsupported: [],
      },
    }

    const response = await handleUserMessage(
      "project_1",
      "跳过这一步，直接继续。",
      async () => initial,
      async () => undefined,
      async () => ({ type: "finish", reasoningSummary: "unused" }),
      createFastToolRegistry(),
    )

    expect(response.status).toBe("completed")
    expect(response.state.blueprint).toBeDefined()
    expect(response.state.build).toBeDefined()
    expect(response.messages.map((message) => message.type)).toEqual(expect.arrayContaining(["agent-blueprint", "agent-build"]))
  })
})

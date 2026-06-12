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

function createFastToolRegistry(options: { onRepair?: (args: Record<string, unknown>) => void } = {}) {
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
    {
      name: "repair_application",
      execute: async (args) => {
        options.onRepair?.(args)
        return {
          summary: "应用修复完成",
          statePatch: { build: { summary: "repaired", files: [{ path: "/App.tsx", content: "export default function App() { return <main>fixed</main> }" }] } },
        }
      },
    },
    {
      name: "regenerate_page",
      execute: async () => ({
        summary: "页面重生成完成",
        statePatch: { build: { summary: "changed", files: [{ path: "/App.tsx", content: "export default function App() { return <main>changed</main> }" }] } },
      }),
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

  it("repairs the generated app when the user pastes an application error", async () => {
    mockedParseUserIntent.mockResolvedValueOnce({
      type: "repair_application",
      instruction: "Console Error: Something went wrong Unknown character: 0",
      confidence: 0.95,
    })
    const initial = {
      ...createInitialAgentState("project_1", "销售团队在用 Excel 管理客户，经常漏跟线索"),
      status: "waiting_for_user" as const,
      strategy: validStrategy,
      blueprint: validBlueprint,
      build: { summary: "broken", files: [{ path: "/App.tsx", content: "\u0000export default function App() { return null }" }] },
      review: undefined,
    }
    const savedStates: string[] = []

    const response = await handleUserMessage(
      "project_1",
      "Console Error: Something went wrong Unknown character: 0",
      async () => initial,
      async (state) => { savedStates.push(state.waitingForStep ?? "") },
      async () => ({ type: "finish", reasoningSummary: "unused" }),
      createFastToolRegistry(),
    )

    expect(response.status).toBe("waiting_for_user")
    expect(response.message).toMatchObject({ type: "agent-build" })
    expect(response.state.build?.summary).toBe("repaired")
    expect(response.state.review).toBeUndefined()
    expect(response.state.repairAttempts).toBe(1)
    expect(response.state.toolCalls.at(-1)).toMatchObject({ toolName: "repair_application", status: "completed" })
    expect(savedStates.at(-1)).toBe("repair_application")
  })

  it("repairs a completed generated app when the user pastes an application error", async () => {
    mockedParseUserIntent.mockResolvedValueOnce({
      type: "repair_application",
      instruction: "Something went wrong Unknown character: 0",
      confidence: 0.95,
    })
    const initial = {
      ...createInitialAgentState("project_1", "销售团队在用 Excel 管理客户，经常漏跟线索"),
      status: "completed" as const,
      strategy: validStrategy,
      blueprint: validBlueprint,
      build: { summary: "broken", files: [{ path: "/App.tsx", content: "\u0000export default function App() { return null }" }] },
      review: passingReview,
    }

    let repairArgs: Record<string, unknown> | undefined
    const response = await handleUserMessage(
      "project_1",
      "Something went wrong Unknown character: 0",
      async () => initial,
      async () => undefined,
      async () => ({ type: "finish", reasoningSummary: "unused" }),
      createFastToolRegistry({ onRepair: (args) => { repairArgs = args } }),
    )

    expect(response.status).toBe("waiting_for_user")
    expect(response.message).toMatchObject({ type: "agent-build" })
    expect(response.state.build?.summary).toBe("repaired")
    expect(response.state.toolCalls.at(-1)).toMatchObject({ toolName: "repair_application", status: "completed" })
    expect(repairArgs?.review).toMatchObject({
      passed: false,
      issues: [expect.objectContaining({ message: "Something went wrong Unknown character: 0" })],
    })
  })

  it("allows user-initiated repair even when automatic repair budget was used", async () => {
    mockedParseUserIntent.mockResolvedValueOnce({
      type: "repair_application",
      instruction: "Something went wrong Unknown character: 0",
      confidence: 0.95,
    })
    const initial = {
      ...createInitialAgentState("project_1", "销售团队在用 Excel 管理客户，经常漏跟线索"),
      status: "waiting_for_user" as const,
      strategy: validStrategy,
      blueprint: validBlueprint,
      build: { summary: "broken", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
      repairAttempts: 1,
    }

    const response = await handleUserMessage(
      "project_1",
      "Something went wrong Unknown character: 0",
      async () => initial,
      async () => undefined,
      async () => ({ type: "finish", reasoningSummary: "unused" }),
      createFastToolRegistry(),
    )

    expect(response.status).toBe("waiting_for_user")
    expect(response.message).toMatchObject({ type: "agent-build" })
    expect(response.state.repairAttempts).toBe(2)
  })

  it("regenerates the generated app when the user asks for a feature change", async () => {
    mockedParseUserIntent.mockResolvedValueOnce({
      type: "regenerate_page",
      targetPage: "客户详情页面",
      instruction: "新增客户详情页面",
      confidence: 0.9,
    })
    const initial = {
      ...createInitialAgentState("project_1", "销售团队在用 Excel 管理客户，经常漏跟线索"),
      status: "waiting_for_user" as const,
      strategy: validStrategy,
      blueprint: validBlueprint,
      build: { summary: "current", files: [{ path: "/App.tsx", content: "export default function App() { return null }" }] },
    }

    const response = await handleUserMessage(
      "project_1",
      "新增客户详情页面",
      async () => initial,
      async () => undefined,
      async () => ({ type: "finish", reasoningSummary: "unused" }),
      createFastToolRegistry(),
    )

    expect(response.status).toBe("waiting_for_user")
    expect(response.message).toMatchObject({ type: "agent-build" })
    expect(response.state.build?.summary).toBe("changed")
    expect(response.state.waitingForStep).toBe("regenerate_page")
  })
})

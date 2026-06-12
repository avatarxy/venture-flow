import { beforeEach, describe, expect, it, vi } from "vitest"
import { POST } from "./route"
import { getProject } from "@/server/projects/project-repository"
import { saveAgentState } from "@/server/agent-state/agent-state-repository"
import { saveChatMessage } from "@/server/messages/message-repository"
import { handleUserMessageStream } from "@/server/agent/supervisor"

vi.mock("@/server/projects/project-repository", () => ({
  getProject: vi.fn(),
}))

vi.mock("@/server/agent-state/agent-state-repository", () => ({
  saveAgentState: vi.fn(),
}))

vi.mock("@/server/messages/message-repository", () => ({
  saveChatMessage: vi.fn(async () => ({ id: "message_1" })),
  getChatMessages: vi.fn(async () => []),
}))

vi.mock("@/server/tools/tool-suite", () => ({
  createVentureFlowToolSuite: vi.fn(() => ({ get: vi.fn() })),
}))

vi.mock("@/server/agent/supervisor", () => ({
  handleUserMessage: vi.fn(),
  handleUserMessageStream: vi.fn(),
}))

const mockedGetProject = vi.mocked(getProject)
const mockedSaveAgentState = vi.mocked(saveAgentState)
const mockedSaveChatMessage = vi.mocked(saveChatMessage)
const mockedHandleUserMessageStream = vi.mocked(handleUserMessageStream)

const context = { params: Promise.resolve({ projectId: "project_1" }) }

function createPostRequest(message = "继续") {
  return new Request("http://test.local/api/projects/project_1/agent/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
}

describe("agent messages route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetProject.mockResolvedValue({
      id: "project_1",
      originalProblem: "销售团队在用 Excel 管理客户，经常漏跟线索",
      agentState: null,
    } as never)
    mockedSaveAgentState.mockResolvedValue({} as never)
  })

  it("persists streamed result messages once even when repeated as finalMessage", async () => {
    const agentMessage = {
      role: "agent" as const,
      type: "agent-build" as const,
      content: "应用生成完成",
      metadata: { build: { summary: "ok", files: [] } },
    }
    mockedHandleUserMessageStream.mockImplementationOnce(async (_projectId, _message, _loader, _saver, _registry, emit) => {
      emit({ type: "result", message: agentMessage, plan: [] })
      emit({ type: "done", status: "waiting_for_user", finalMessage: agentMessage })
    })

    const response = await POST(createPostRequest(), context)
    const body = await response.text()

    expect(response.headers.get("Content-Type")).toContain("text/event-stream")
    expect(body).toContain("agent-build")
    expect(mockedSaveChatMessage).toHaveBeenCalledTimes(1)
    expect(mockedSaveChatMessage).toHaveBeenCalledWith({
      projectId: "project_1",
      role: "agent",
      type: "agent-build",
      content: "应用生成完成",
      metadata: { build: { summary: "ok", files: [] } },
    })
  })

  it("persists streamed error events so refresh can show the failure card", async () => {
    mockedHandleUserMessageStream.mockImplementationOnce(async (_projectId, _message, _loader, _saver, _registry, emit) => {
      emit({ type: "error", message: "执行 repair_application 失败: 编译失败" })
      emit({ type: "done", status: "failed" })
    })

    const response = await POST(createPostRequest("这是报错信息"), context)
    await response.text()

    expect(mockedSaveChatMessage).toHaveBeenCalledWith({
      projectId: "project_1",
      role: "agent",
      type: "agent-error",
      content: "执行 repair_application 失败: 编译失败",
      metadata: { error: true },
    })
  })
})

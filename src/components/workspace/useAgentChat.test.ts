import { afterEach, describe, expect, it, vi } from "vitest"
import {
  appendAgentCardMessage,
  findStreamingAssistantIndex,
  removeStreamingAssistantMessage,
  VentureFlowAgentTransport,
  type AgentMessagePayload,
  type WorkspaceUiMessage,
} from "./useAgentChat"

function message(input: {
  id: string
  role?: "user" | "assistant" | "system"
  text: string
  metadata?: Record<string, unknown>
}): WorkspaceUiMessage {
  return {
    id: input.id,
    role: input.role ?? "assistant",
    parts: [{ type: "text", text: input.text }],
    metadata: input.metadata,
  } as WorkspaceUiMessage
}

describe("workspace agent chat message merging", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("appends result cards even when no streaming assistant placeholder exists yet", () => {
    const prev = [message({ id: "user-1", role: "user", text: "继续" })]
    const card = message({ id: "card-1", text: "Product Blueprint", metadata: { type: "agent-blueprint" } })

    expect(appendAgentCardMessage(prev, card).map((item) => item.id)).toEqual(["user-1", "card-1"])
  })

  it("inserts result cards before the streaming placeholder and removes only that placeholder", () => {
    const prev = [
      message({ id: "user-1", role: "user", text: "继续" }),
      message({ id: "stream-1", text: "⏳ 生成 Product Blueprint\n" }),
    ]
    const card = message({ id: "card-1", text: "Product Blueprint", metadata: { type: "agent-blueprint" } })

    const withCard = appendAgentCardMessage(prev, card)

    expect(withCard.map((item) => item.id)).toEqual(["user-1", "card-1", "stream-1"])
    expect(findStreamingAssistantIndex(withCard)).toBe(2)
    expect(removeStreamingAssistantMessage(withCard).map((item) => item.id)).toEqual(["user-1", "card-1"])
  })

  it("does not remove visible error text when it is not a streaming placeholder", () => {
    const prev = [
      message({ id: "user-1", role: "user", text: "继续" }),
      message({ id: "error-1", text: "❌ 执行 create_blueprint 失败" }),
    ]

    expect(removeStreamingAssistantMessage(prev).map((item) => item.id)).toEqual(["user-1", "error-1"])
  })

  it("surfaces SSE errors as agent-error cards instead of transient text", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      'data: {"type":"error","message":"执行 create_blueprint 失败: AI request failed"}\n\n',
      { headers: { "content-type": "text/event-stream" } },
    )))

    const transport = new VentureFlowAgentTransport("/api/test")
    const cards: AgentMessagePayload[] = []
    transport.onCard((card) => cards.push(card))

    const stream = await transport.sendMessages({
      messages: [message({ id: "user-1", role: "user", text: "继续" })],
    } as never)

    await stream?.pipeTo(new WritableStream())

    expect(cards).toEqual([
      expect.objectContaining({
        role: "agent",
        type: "agent-error",
        content: "执行 create_blueprint 失败: AI request failed",
      }),
    ])
  })
})

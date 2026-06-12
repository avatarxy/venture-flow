import { describe, expect, it } from "vitest"
import { extractPreviewFiles, getMessageText, getMessageType } from "./message-utils"

describe("chat message utilities", () => {
  it("reads message text from AI SDK UIMessage text parts", () => {
    expect(
      getMessageText({
        id: "msg_1",
        role: "assistant",
        parts: [
          { type: "step-start" },
          { type: "text", text: "Strategy 已完成" },
          { type: "text", text: "，正在生成 Blueprint" },
        ],
      }),
    ).toBe("Strategy 已完成，正在生成 Blueprint")
  })

  it("falls back to legacy content and metadata message type", () => {
    expect(
      getMessageText({
        id: "msg_2",
        role: "assistant",
        content: "构建完成",
      }),
    ).toBe("构建完成")

    expect(
      getMessageType({
        id: "msg_2",
        role: "assistant",
        metadata: { type: "agent-build" },
      }),
    ).toBe("agent-build")
  })

  it("extracts preview files from build metadata only when files are valid", () => {
    expect(
      extractPreviewFiles({
        id: "msg_3",
        role: "assistant",
        metadata: {
          build: {
            files: [
              { path: "/App.tsx", content: "export default function App() { return <main /> }" },
              { path: "/styles.css", content: "body { margin: 0; }" },
            ],
          },
        },
      }),
    ).toEqual([
      { path: "/App.tsx", content: "export default function App() { return <main /> }" },
      { path: "/styles.css", content: "body { margin: 0; }" },
    ])

    expect(extractPreviewFiles({ id: "msg_4", role: "assistant", metadata: { build: { files: [] } } })).toEqual([])
  })
})

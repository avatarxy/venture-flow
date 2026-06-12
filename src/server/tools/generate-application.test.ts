import { describe, expect, it, vi } from "vitest"
import { validBlueprint } from "@/server/agent/agent-fixtures"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { generateApplication } from "./generate-application"

vi.mock("@/server/ai/generate-structured", () => ({
  generateStructuredObject: vi.fn(),
}))

const mockedGenerateStructuredObject = vi.mocked(generateStructuredObject)

describe("generateApplication", () => {
  it("uses the app builder prompt and build output schema", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成销售管理应用",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
    })

    const result = await generateApplication(validBlueprint)

    expect(result.files[0]?.path).toBe("/App.tsx")
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("必须包含 /App.tsx"),
        prompt: expect.stringContaining("销售管理"),
      }),
    )
  })

  it("requires modular pages, Tailwind, and shadcn ui in the builder prompt", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成销售管理应用",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
    })

    await generateApplication(validBlueprint)

    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("/pages"),
      }),
    )
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("Tailwind"),
      }),
    )
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("shadcn/ui"),
      }),
    )
  })

  it("requires a complete interactive local-first product in the builder prompt", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成销售管理应用",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
    })

    await generateApplication(validBlueprint)

    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("禁止生成建设中"),
      }),
    )
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("/lib/storage.ts"),
      }),
    )
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("Postgres adapter"),
      }),
    )
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("每个页面都必须可交互"),
      }),
    )
  })

  it("forbids react-router-dom and asks for state based routing", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成销售管理应用",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
    })

    await generateApplication(validBlueprint)

    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("react-router-dom"),
      }),
    )
    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("useState"),
      }),
    )
  })

  it("throws when generated build is missing /App.tsx", async () => {
    // 模拟 LLM 返回了没有 /App.tsx 的结果
    // 新流程：loose schema 接收 → normalizeFilePath → buildOutputSchema.parse 校验
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成应用",
      files: [{ path: "/index.tsx", content: "export default function Index() { return null }" }],
    })

    await expect(generateApplication(validBlueprint)).rejects.toThrow("生成应用必须包含 /App.tsx 入口文件")
  })

  it("includes safety constraints in the prompt", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成销售管理应用",
      files: [{ path: "/App.tsx", content: "export default function App() { return null }" }],
    })

    await generateApplication(validBlueprint)

    expect(mockedGenerateStructuredObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("vf-generated-"),
      }),
    )
  })

  it("removes invisible control characters that break Sandpack parsing", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成销售管理应用",
      files: [
        {
          path: "/App.tsx",
          content: "\u0000export default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }\u0000",
        },
      ],
    })

    const result = await generateApplication(validBlueprint)

    expect(result.files[0]?.content).not.toContain("\u0000")
    expect(result.files[0]?.content).toContain("localStorage.setItem")
    expect(result.files[0]?.content).toContain("\n  return null;")
  })

  it("formats generated TSX files before they are shown in the code editor", async () => {
    mockedGenerateStructuredObject.mockResolvedValueOnce({
      summary: "生成销售管理应用",
      files: [
        {
          path: "/App.tsx",
          content: "export default function App(){return <main><button onClick={()=>localStorage.setItem('vf-generated-demo','1')}>新增</button></main>}",
        },
      ],
    })

    const result = await generateApplication(validBlueprint)

    expect(result.files[0]?.content).toContain("export default function App()")
    expect(result.files[0]?.content).toContain("\n  return (")
    expect(result.files[0]?.content).toContain("\n    <main>")
  })
})

import { describe, expect, it } from "vitest"
import { inspectBuild } from "./inspect-build"

describe("inspectBuild", () => {
  it("rejects build without App entry", () => {
    const result = inspectBuild({ summary: "bad", files: [{ path: "/index.tsx", content: "export {}" }] })

    expect(result.passed).toBe(false)
    expect(result.issues[0]?.type).toBe("missing_file")
  })

  it("rejects forbidden dependency", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "import axios from 'axios'; export default function App() { return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues[0]?.type).toBe("forbidden_dependency")
  })

  it("rejects generated apps without localStorage persistence", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "export default function App() { return <button>新增</button> }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "persistence_missing")).toBe(true)
  })

  it("rejects forbidden browser boundary APIs", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [
        {
          path: "/App.tsx",
          content:
            "export default function App() { fetch('https://example.com'); document.body.innerHTML = 'x'; localStorage.setItem('vf-generated-demo', '1'); return null }",
        },
      ],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.filter((issue) => issue.type === "forbidden_dependency").length).toBeGreaterThanOrEqual(2)
    expect(result.issues.map((issue) => issue.message).join(" ")).toContain("外部网络请求")
    expect(result.issues.map((issue) => issue.message).join(" ")).toContain("宿主页面 DOM")
  })

  it("passes a bounded generated app", () => {
    const result = inspectBuild({
      summary: "ok",
      files: [
        {
          path: "/App.tsx",
          content:
            "import React from 'react'; export default function App() { localStorage.setItem('vf-generated-demo', '1'); return <button onClick={() => localStorage.getItem('vf-generated-demo')}>新增线索</button> }",
        },
      ],
    })

    expect(result).toEqual({ passed: true, issues: [] })
  })
})

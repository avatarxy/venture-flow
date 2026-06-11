import { describe, expect, it } from "vitest"
import { inspectBuild } from "./inspect-build"

describe("inspectBuild", () => {
  it("rejects build without App entry", () => {
    const result = inspectBuild({ summary: "bad", files: [{ path: "/index.tsx", content: "export {}" }] })

    expect(result.passed).toBe(false)
    expect(result.issues[0]?.type).toBe("missing_file")
  })

  it("rejects forbidden dependency via import", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "import axios from 'axios'; export default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues[0]?.type).toBe("forbidden_dependency")
    expect(result.issues[0]?.message).toContain("axios")
  })

  it("rejects forbidden dependency via require", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "const fs = require('fs'); export default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "forbidden_dependency" && issue.message.includes("fs"))).toBe(true)
  })

  it("rejects non-whitelisted npm package", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "import dayjs from 'dayjs'; export default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "forbidden_dependency" && issue.message.includes("dayjs"))).toBe(true)
  })

  it("allows whitelisted dependencies", () => {
    const result = inspectBuild({
      summary: "ok",
      files: [
        {
          path: "/App.tsx",
          content: "import React from 'react'; import { BarChart } from 'recharts'; import { Button } from 'lucide-react'; export default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }",
        },
      ],
    })

    expect(result.passed).toBe(true)
  })

  it("rejects generated apps without localStorage persistence", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "export default function App() { return <button>新增</button> }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "persistence_missing")).toBe(true)
  })

  it("rejects localStorage keys without vf-generated- prefix", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "export default function App() { localStorage.setItem('my-data', '1'); return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "persistence_missing" && issue.message.includes("my-data"))).toBe(true)
  })

  it("accepts localStorage keys with vf-generated- prefix", () => {
    const result = inspectBuild({
      summary: "ok",
      files: [{ path: "/App.tsx", content: "export default function App() { localStorage.setItem('vf-generated-demo', '1'); localStorage.getItem('vf-generated-demo'); return null }" }],
    })

    expect(result.passed).toBe(true)
  })

  it("rejects forbidden browser boundary APIs", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [
        {
          path: "/App.tsx",
          content:
            "export default function App() { fetch('https://example.com'); document.getElementById('root'); localStorage.setItem('vf-generated-demo', '1'); return null }",
        },
      ],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.filter((issue) => issue.type === "forbidden_dependency").length).toBeGreaterThanOrEqual(2)
    expect(result.issues.map((issue) => issue.message).join(" ")).toContain("外部网络请求")
    expect(result.issues.map((issue) => issue.message).join(" ")).toContain("宿主页面 DOM")
  })

  it("does not flag document.title or document.addEventListener in comments", () => {
    const result = inspectBuild({
      summary: "ok",
      files: [
        {
          path: "/App.tsx",
          content:
            "// document.getElementById('test') should not trigger\nexport default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }",
        },
      ],
    })

    expect(result.passed).toBe(true)
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

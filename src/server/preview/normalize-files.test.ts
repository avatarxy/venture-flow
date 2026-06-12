import { describe, expect, it } from "vitest"
import {
  getVisibleGeneratedFilePaths,
  normalizeSandpackFiles,
} from "./normalize-files"

describe("normalizeSandpackFiles", () => {
  it("adds Sandpack boot files and preserves generated files", () => {
    const files = normalizeSandpackFiles([
      {
        path: "/App.tsx",
        content: "export default function App() { return <main>Hello</main> }",
      },
    ])

    expect(files["/App.tsx"].code).toContain("export default")
    expect(files["/App.tsx"].active).toBe(true)
    expect(files["/package.json"].code).toContain("react")
    expect(files["/index.html"].code).toContain("src/main.tsx")
    expect(files["/src/main.tsx"].code).toContain("createRoot")
  })

  it("pins Sandpack runtime dependencies instead of using latest", () => {
    const files = normalizeSandpackFiles([
      {
        path: "/App.tsx",
        content: "export default function App() { return <main>Hello</main> }",
      },
    ])
    const packageJson = JSON.parse(files["/package.json"].code) as { dependencies: Record<string, string> }

    expect(Object.values(packageJson.dependencies)).not.toContain("latest")
    expect(packageJson.dependencies.react).toBe("18.2.0")
    expect(packageJson.dependencies.vite).toBe("5.4.21")
  })

  it("keeps supporting generated files visible and inactive", () => {
    const files = normalizeSandpackFiles([
      {
        path: "/App.tsx",
        content: "export default function App() { return null }",
      },
      {
        path: "/components/LeadList.tsx",
        content: "export function LeadList() { return null }",
      },
    ])

    expect(files["/components/LeadList.tsx"]).toEqual({
      code: "export function LeadList() { return null }",
      active: false,
    })
  })

  it("deduplicates generated file paths for Sandpack visible files", () => {
    expect(
      getVisibleGeneratedFilePaths([
        { path: "/App.tsx", content: "first" },
        { path: "/LeadsPage.tsx", content: "page" },
        { path: "/App.tsx", content: "second" },
      ]),
    ).toEqual(["/App.tsx", "/LeadsPage.tsx"])
  })

  it("removes invisible control characters before files enter Sandpack", () => {
    const files = normalizeSandpackFiles([
      {
        path: "/App.tsx",
        content: "\u0000export default function App() { return null }\u0000",
      },
    ])

    expect(files["/App.tsx"].code).toBe("export default function App() { return null }")
  })

  it("rejects generated files that try to override Sandpack runtime files", () => {
    expect(() =>
      normalizeSandpackFiles([
        {
          path: "/App.tsx",
          content: "export default function App() { return null }",
        },
        {
          path: "/package.json",
          content: '{"dependencies":{"left-pad":"latest"}}',
        },
      ]),
    ).toThrow(
      "Generated app cannot override Sandpack runtime file: /package.json",
    )
  })
})

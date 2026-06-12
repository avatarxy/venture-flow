import { describe, expect, it } from "vitest"
import { normalizeSandpackFiles } from "./normalize-files"

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

  it("keeps supporting generated files visible and inactive", () => {
    const files = normalizeSandpackFiles([
      { path: "/App.tsx", content: "export default function App() { return null }" },
      { path: "/components/LeadList.tsx", content: "export function LeadList() { return null }" },
    ])

    expect(files["/components/LeadList.tsx"]).toEqual({
      code: "export function LeadList() { return null }",
      active: false,
    })
  })

  it("rejects generated files that try to override Sandpack runtime files", () => {
    expect(() =>
      normalizeSandpackFiles([
        { path: "/App.tsx", content: "export default function App() { return null }" },
        { path: "/package.json", content: "{\"dependencies\":{\"left-pad\":\"latest\"}}" },
      ]),
    ).toThrow("Generated app cannot override Sandpack runtime file: /package.json")
  })
})

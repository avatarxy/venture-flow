import { describe, expect, it } from "vitest"
import {
  getVisibleGeneratedFilePaths,
  normalizeSandpackFiles,
  sandpackGeneratedAppDependencies,
} from "./normalize-files"

describe("normalizeSandpackFiles", () => {
  it("adds Sandpack boot files without overriding template package and preserves generated files", () => {
    const files = normalizeSandpackFiles([
      {
        path: "/App.tsx",
        content: "export default function App() { return <main>Hello</main> }",
      },
    ])

    expect(files["/App.tsx"].code).toContain("export default")
    expect(files["/App.tsx"].active).toBe(true)
    expect(files["/package.json"]).toBeUndefined()
    expect(files["/index.html"].code).toContain("src/main.tsx")
    expect(files["/src/main.tsx"].code).toContain("createRoot")
  })

  it("provides generated app dependencies through Sandpack custom setup", () => {
    expect(sandpackGeneratedAppDependencies.dependencies).toMatchObject({
      "lucide-react": "0.468.0",
      recharts: "2.13.3",
      tailwindcss: "3.4.17",
      postcss: "8.4.49",
      autoprefixer: "10.4.20",
    })
    expect(sandpackGeneratedAppDependencies.dependencies).not.toHaveProperty("class-variance-authority")
    expect(sandpackGeneratedAppDependencies.dependencies).not.toHaveProperty("@radix-ui/react-slot")
    expect(sandpackGeneratedAppDependencies.dependencies).not.toHaveProperty("clsx")
    expect(sandpackGeneratedAppDependencies.dependencies).not.toHaveProperty("tailwind-merge")
    expect(Object.values(sandpackGeneratedAppDependencies.dependencies)).not.toContain("latest")
  })

  it("adds Tailwind runtime files for generated apps", () => {
    const files = normalizeSandpackFiles([
      {
        path: "/App.tsx",
        content: "export default function App() { return <main className=\"p-6\">Hello</main> }",
      },
    ])

    expect(files["/src/main.tsx"].code).toContain('import "./index.css"')
    expect(files["/src/index.css"].code).toContain("@tailwind base")
    expect(files["/src/index.css"].code).toContain("--background")
    expect(files["/tailwind.config.cjs"].code).toContain("module.exports")
    expect(files["/tailwind.config.cjs"].code).toContain("./pages/**/*.{ts,tsx,js,jsx}")
    expect(files["/tailwind.config.cjs"].code).toContain("./components/**/*.{ts,tsx,js,jsx}")
    expect(files["/postcss.config.cjs"].code).toContain("module.exports")
    expect(files["/postcss.config.cjs"].code).toContain("tailwindcss")
    expect(files["/vite.config.ts"].code).toContain("tailwindcss(tailwindConfig)")
    expect(files["/vite.config.ts"].code).toContain("autoprefixer()")
    expect(files["/vite.config.ts"].code).toContain('"@"')
    expect(files["/tsconfig.json"].code).toContain('"@/*"')
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

  it("silently skips generated files that conflict with Sandpack runtime files instead of crashing", () => {
    const files = normalizeSandpackFiles([
      {
        path: "/App.tsx",
        content: "export default function App() { return null }",
      },
      {
        path: "/src/index.css",
        content: "@tailwind base;",
      },
    ])

    // Runtime file override is silently skipped, App.tsx still present
    expect(files["/App.tsx"].code).toBe("export default function App() { return null }")
    // /package.json 由 Sandpack 模板维护，避免破坏 Nodebox 内置 Vite 依赖
    expect(files["/package.json"]).toBeUndefined()
    // 样式入口由 runtime 维护，避免生成代码覆盖 Tailwind 主题变量
    expect(files["/src/index.css"].code).toContain("@tailwind base")
    expect(files["/tailwind.config.cjs"].code).toContain("module.exports")
  })
})

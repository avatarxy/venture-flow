import type { GeneratedFile } from "@/server/contracts"
import { sanitizeGeneratedFileContent } from "@/server/tools/generated-file-quality"

type SandpackFile = {
  code: string
  active?: boolean
  hidden?: boolean
}

export type NormalizedSandpackFiles = Record<string, SandpackFile>

const packageJson = {
  scripts: {
    start: "vite --host 0.0.0.0",
  },
  dependencies: {
    "@vitejs/plugin-react": "4.3.4",
    vite: "5.4.21",
    typescript: "5.7.3",
    react: "18.2.0",
    "react-dom": "18.2.0",
    "lucide-react": "0.468.0",
    recharts: "2.13.3",
  },
  devDependencies: {},
}

const runtimeFilePaths = new Set([
  "/package.json",
  "/index.html",
  "/src/main.tsx",
])

export function getVisibleGeneratedFilePaths(files: GeneratedFile[]) {
  return Array.from(new Set(files.map((file) => file.path)))
}

export function normalizeSandpackFiles(
  files: GeneratedFile[],
): NormalizedSandpackFiles {
  const normalized: NormalizedSandpackFiles = {
    "/package.json": {
      code: JSON.stringify(packageJson, null, 2),
      hidden: true,
    },
    "/index.html": {
      code: '<div id="root"></div><script type="module" src="/src/main.tsx"></script>',
      hidden: true,
    },
    "/src/main.tsx": {
      code: [
        'import React from "react"',
        'import { createRoot } from "react-dom/client"',
        'import App from "../App"',
        "",
        'createRoot(document.getElementById("root")!).render(',
        "  <React.StrictMode>",
        "    <App />",
        "  </React.StrictMode>,",
        ")",
      ].join("\n"),
      hidden: true,
    },
  }

  for (const file of files) {
    // 跳过与 Sandpack runtime 文件冲突的路径（如 LLM 生成了 /src/main.tsx）
    // 不可能继续抛出错误 → 沙箱将会无法渲染，且用户无法修复。
    if (runtimeFilePaths.has(file.path)) {
      // 如 /App.tsx 等入口文件仍需保留，runtime main.tsx 会 import 到它
      continue
    }

    normalized[file.path] = {
      code: sanitizeGeneratedFileContent(file.content),
      active: file.path === "/App.tsx",
    }
  }

  return normalized
}

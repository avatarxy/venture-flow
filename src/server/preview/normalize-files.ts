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
    if (runtimeFilePaths.has(file.path)) {
      throw new Error(
        `Generated app cannot override Sandpack runtime file: ${file.path}`,
      )
    }

    normalized[file.path] = {
      code: sanitizeGeneratedFileContent(file.content),
      active: file.path === "/App.tsx",
    }
  }

  return normalized
}

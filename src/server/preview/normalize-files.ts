import type { GeneratedFile } from "@/server/contracts"
import { sanitizeGeneratedFileContent } from "@/server/tools/generated-file-quality"

type SandpackFile = {
  code: string
  active?: boolean
  hidden?: boolean
}

export type NormalizedSandpackFiles = Record<string, SandpackFile>

export const sandpackGeneratedAppDependencies = {
  dependencies: {
    "lucide-react": "0.468.0",
    recharts: "2.13.3",
  },
}

const runtimeFilePaths = new Set([
  "/package.json",
  "/index.html",
  "/src/main.tsx",
  "/vite.config.ts",
  "/tsconfig.json",
  "/vite-env.d.ts",
  // 模板残留文件覆盖 — 防止模板的 /index.tsx 导入不存在的 ./styles.css
  "/index.tsx",
  "/styles.css",
  "/tsconfig.node.json",
])

/**
 * Vite 配置文件 — 必须覆盖 Sandpack 模板默认版本以确保与我们的依赖兼容。
 * 包含 React 插件 + Tailwind CSS/PostCSS 自动检测支持。
 */
const viteConfigCode = [
  "import { defineConfig } from 'vite'",
  "import react from '@vitejs/plugin-react'",
  "",
  "export default defineConfig({",
  "  plugins: [react()],",
  "})",
].join("\n")

/**
 * TypeScript 配置文件 — 必须覆盖模板默认版本（模板的 include: ["src"] 会排除根目录文件）。
 */
const tsConfigCode = JSON.stringify({
  compilerOptions: {
    target: "ESNext",
    useDefineForClassFields: true,
    lib: ["DOM", "DOM.Iterable", "ESNext"],
    allowJs: false,
    skipLibCheck: true,
    esModuleInterop: false,
    allowSyntheticDefaultImports: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    module: "ESNext",
    moduleResolution: "Node",
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: "react-jsx",
  },
  include: ["/**/*.ts", "/**/*.tsx"],
}, null, 2)

/**
 * Vite 环境类型声明
 */
const viteEnvDtsCode = '/// <reference types="vite/client" />'

/**
 * 最终安全验证：确保代码不包含任何会导致 Sandpack/Babel 解析失败的字符。
 * 这是进入 Sandpack 之前的最后一道防线。
 */
function finalSanitize(code: string): string {
  return code
    .replace(/\u0000/g, "") // NUL — 最致命
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "") // C0/C1 控制字符
    .replace(/[\uFEFF\uFFFE]/g, "") // BOM
    .replace(/[\u200B-\u200D\u2060]/g, "") // 零宽字符
    .replace(/\u2028|\u2029/g, "\n") // Unicode 分隔符
}

export function getVisibleGeneratedFilePaths(files: GeneratedFile[]) {
  return Array.from(new Set(files.map((file) => file.path)))
}

export function normalizeSandpackFiles(
  files: GeneratedFile[],
): NormalizedSandpackFiles {
  const normalized: NormalizedSandpackFiles = {
    "/index.html": {
      code: finalSanitize(
        '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>',
      ),
      hidden: true,
    },
    "/src/main.tsx": {
      code: finalSanitize([
        'import React from "react"',
        'import { createRoot } from "react-dom/client"',
        'import App from "../App"',
        "",
        'createRoot(document.getElementById("root")!).render(',
        "  <React.StrictMode>",
        "    <App />",
        "  </React.StrictMode>,",
        ")",
      ].join("\n")),
      hidden: true,
    },
    // 覆盖 Sandpack 模板默认的 vite.config.ts（确保与 Vite 4 兼容 + 支持 Tailwind）
    "/vite.config.ts": {
      code: finalSanitize(viteConfigCode),
      hidden: true,
    },
    // 覆盖模板默认的 tsconfig.json（模板的 include: ["src"] 排除了根目录 .tsx 文件）
    "/tsconfig.json": {
      code: finalSanitize(tsConfigCode),
      hidden: true,
    },
    "/vite-env.d.ts": {
      code: finalSanitize(viteEnvDtsCode),
      hidden: true,
    },
    // 覆盖 Sandpack 模板残留文件，防止冲突
    "/index.tsx": {
      code: finalSanitize([
        "// This file is intentionally replaced by /src/main.tsx",
        "export {}",
      ].join("\n")),
      hidden: true,
    },
    "/styles.css": {
      code: finalSanitize("/* Tailwind CSS is auto-detected via postcss.config.js */"),
      hidden: true,
    },
    "/tsconfig.node.json": {
      code: finalSanitize(JSON.stringify({
        compilerOptions: {
          composite: true,
          module: "ESNext",
          moduleResolution: "Node",
          allowSyntheticDefaultImports: true,
        },
        include: ["/vite.config.ts"],
      }, null, 2)),
      hidden: true,
    },
  }

  for (const file of files) {
    // 跳过与 Sandpack runtime 文件冲突的路径（如 LLM 生成了 /src/main.tsx）
    if (runtimeFilePaths.has(file.path)) {
      continue
    }

    // 双重清洗：sanitizeGeneratedFileContent（含 Markdown 提取） + finalSanitize（最终防线）
    normalized[file.path] = {
      code: finalSanitize(sanitizeGeneratedFileContent(file.content)),
      active: file.path === "/App.tsx",
    }
  }

  return normalized
}

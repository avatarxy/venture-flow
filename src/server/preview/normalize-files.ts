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
    tailwindcss: "3.4.17",
    postcss: "8.4.49",
    autoprefixer: "10.4.20",
    "class-variance-authority": "0.7.1",
    clsx: "2.1.1",
    "tailwind-merge": "2.5.5",
    "@radix-ui/react-slot": "1.1.1",
  },
}

const runtimeFilePaths = new Set([
  "/package.json",
  "/index.html",
  "/src/main.tsx",
  "/vite.config.ts",
  "/tsconfig.json",
  "/vite-env.d.ts",
  "/src/index.css",
  "/tailwind.config.cjs",
  "/postcss.config.cjs",
  // 模板残留文件覆盖 — 防止模板的 /index.tsx 导入不存在的 ./styles.css
  "/index.tsx",
  "/styles.css",
  "/tsconfig.node.json",
  "/tailwind.config.js",
  "/postcss.config.js",
])

/**
 * Vite 配置文件 — 必须覆盖 Sandpack 模板默认版本以确保与我们的依赖兼容。
 * 包含 React 插件 + 内联 Tailwind/PostCSS 插件，避免 Nodebox 忽略外部 PostCSS 配置。
 */
const viteConfigCode = [
  "import { defineConfig } from 'vite'",
  "import react from '@vitejs/plugin-react'",
  "import tailwindcss from 'tailwindcss'",
  "import autoprefixer from 'autoprefixer'",
  "",
  "const tailwindConfig = {",
  "  content: [",
  '    "./index.html",',
  '    "./App.{ts,tsx,js,jsx}",',
  '    "./pages/**/*.{ts,tsx,js,jsx}",',
  '    "./components/**/*.{ts,tsx,js,jsx}",',
  '    "./lib/**/*.{ts,tsx,js,jsx}",',
  '    "./data/**/*.{ts,tsx,js,jsx}",',
  '    "./src/**/*.{ts,tsx,js,jsx}",',
  "  ],",
  "  theme: {",
  "    extend: {",
  "      colors: {",
  '        border: "hsl(var(--border))",',
  '        input: "hsl(var(--input))",',
  '        ring: "hsl(var(--ring))",',
  '        background: "hsl(var(--background))",',
  '        foreground: "hsl(var(--foreground))",',
  "        primary: {",
  '          DEFAULT: "hsl(var(--primary))",',
  '          foreground: "hsl(var(--primary-foreground))",',
  "        },",
  "        secondary: {",
  '          DEFAULT: "hsl(var(--secondary))",',
  '          foreground: "hsl(var(--secondary-foreground))",',
  "        },",
  "        muted: {",
  '          DEFAULT: "hsl(var(--muted))",',
  '          foreground: "hsl(var(--muted-foreground))",',
  "        },",
  "        accent: {",
  '          DEFAULT: "hsl(var(--accent))",',
  '          foreground: "hsl(var(--accent-foreground))",',
  "        },",
  "        destructive: {",
  '          DEFAULT: "hsl(var(--destructive))",',
  '          foreground: "hsl(var(--destructive-foreground))",',
  "        },",
  "        card: {",
  '          DEFAULT: "hsl(var(--card))",',
  '          foreground: "hsl(var(--card-foreground))",',
  "        },",
  "      },",
  "      borderRadius: {",
  '        lg: "var(--radius)",',
  '        md: "calc(var(--radius) - 2px)",',
  '        sm: "calc(var(--radius) - 4px)",',
  "      },",
  "    },",
  "  },",
  "  plugins: [],",
  "}",
  "",
  "export default defineConfig({",
  "  plugins: [react()],",
  "  css: {",
  "    postcss: {",
  "      plugins: [tailwindcss(tailwindConfig), autoprefixer()],",
  "    },",
  "  },",
  "  resolve: {",
  "    alias: {",
  '      "@": new URL(".", import.meta.url).pathname,',
  "    },",
  "  },",
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
    baseUrl: ".",
    paths: {
      "@/*": ["./*"],
    },
  },
  include: ["/**/*.ts", "/**/*.tsx"],
}, null, 2)

/**
 * Vite 环境类型声明
 */
const viteEnvDtsCode = '/// <reference types="vite/client" />'

const tailwindConfigCode = [
  "/** @type {import('tailwindcss').Config} */",
  "module.exports = {",
  "  content: [",
  '    "./index.html",',
  '    "./App.{ts,tsx,js,jsx}",',
  '    "./pages/**/*.{ts,tsx,js,jsx}",',
  '    "./components/**/*.{ts,tsx,js,jsx}",',
  '    "./lib/**/*.{ts,tsx,js,jsx}",',
  '    "./data/**/*.{ts,tsx,js,jsx}",',
  '    "./src/**/*.{ts,tsx,js,jsx}",',
  "  ],",
  "  theme: {",
  "    extend: {",
  "      colors: {",
  '        border: "hsl(var(--border))",',
  '        input: "hsl(var(--input))",',
  '        ring: "hsl(var(--ring))",',
  '        background: "hsl(var(--background))",',
  '        foreground: "hsl(var(--foreground))",',
  "        primary: {",
  '          DEFAULT: "hsl(var(--primary))",',
  '          foreground: "hsl(var(--primary-foreground))",',
  "        },",
  "        secondary: {",
  '          DEFAULT: "hsl(var(--secondary))",',
  '          foreground: "hsl(var(--secondary-foreground))",',
  "        },",
  "        muted: {",
  '          DEFAULT: "hsl(var(--muted))",',
  '          foreground: "hsl(var(--muted-foreground))",',
  "        },",
  "        accent: {",
  '          DEFAULT: "hsl(var(--accent))",',
  '          foreground: "hsl(var(--accent-foreground))",',
  "        },",
  "        destructive: {",
  '          DEFAULT: "hsl(var(--destructive))",',
  '          foreground: "hsl(var(--destructive-foreground))",',
  "        },",
  "        card: {",
  '          DEFAULT: "hsl(var(--card))",',
  '          foreground: "hsl(var(--card-foreground))",',
  "        },",
  "      },",
  "      borderRadius: {",
  '        lg: "var(--radius)",',
  '        md: "calc(var(--radius) - 2px)",',
  '        sm: "calc(var(--radius) - 4px)",',
  "      },",
  "    },",
  "  },",
  "  plugins: [],",
  "}",
].join("\n")

const postcssConfigCode = [
  "module.exports = {",
  "  plugins: {",
  "    tailwindcss: {},",
  "    autoprefixer: {},",
  "  },",
  "}",
].join("\n")

const indexCssCode = [
  "@tailwind base;",
  "@tailwind components;",
  "@tailwind utilities;",
  "",
  "@layer base {",
  "  :root {",
  "    --background: 0 0% 100%;",
  "    --foreground: 222.2 84% 4.9%;",
  "    --card: 0 0% 100%;",
  "    --card-foreground: 222.2 84% 4.9%;",
  "    --primary: 222.2 47.4% 11.2%;",
  "    --primary-foreground: 210 40% 98%;",
  "    --secondary: 210 40% 96.1%;",
  "    --secondary-foreground: 222.2 47.4% 11.2%;",
  "    --muted: 210 40% 96.1%;",
  "    --muted-foreground: 215.4 16.3% 46.9%;",
  "    --accent: 210 40% 96.1%;",
  "    --accent-foreground: 222.2 47.4% 11.2%;",
  "    --destructive: 0 84.2% 60.2%;",
  "    --destructive-foreground: 210 40% 98%;",
  "    --border: 214.3 31.8% 91.4%;",
  "    --input: 214.3 31.8% 91.4%;",
  "    --ring: 222.2 84% 4.9%;",
  "    --radius: 0.5rem;",
  "  }",
  "",
  "  * {",
  "    @apply border-border;",
  "  }",
  "",
  "  body {",
  "    @apply bg-background text-foreground antialiased;",
  "    margin: 0;",
  "    min-height: 100vh;",
  "    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
  "  }",
  "}",
].join("\n")

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
        'import "./index.css"',
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
    "/src/index.css": {
      code: finalSanitize(indexCssCode),
      hidden: true,
    },
    "/tailwind.config.cjs": {
      code: finalSanitize(tailwindConfigCode),
      hidden: true,
    },
    "/postcss.config.cjs": {
      code: finalSanitize(postcssConfigCode),
      hidden: true,
    },
    // 覆盖 Sandpack 模板残留文件，防止冲突
    "/index.tsx": {
      code: finalSanitize([
        "// 该文件由 /src/main.tsx 接管，避免 Sandpack 模板入口冲突",
        "export {}",
      ].join("\n")),
      hidden: true,
    },
    "/styles.css": {
      code: finalSanitize("/* Tailwind CSS 由 /src/index.css 和 /vite.config.ts 接管 */"),
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

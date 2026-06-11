# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 VentureFlow MVP 的 Next.js 基础工程、开发规范、UI 基础设施和环境配置。

**Architecture:** 使用 Next.js App Router 作为主应用框架，Tailwind CSS 和 shadcn/ui 构建工具型界面。基础工程只提供可运行骨架，不引入业务逻辑。

**Tech Stack:** Next.js、TypeScript、Tailwind CSS、shadcn/ui、lucide-react、Mastra、Vercel AI SDK、Vitest、Playwright、ESLint、Prettier。

---

## 文件结构

```text
package.json
tsconfig.json
next.config.ts
tailwind.config.ts
postcss.config.mjs
eslint.config.mjs
vitest.config.ts
playwright.config.ts
.env.example
src/app/layout.tsx
src/app/page.tsx
src/app/projects/page.tsx
src/app/projects/[projectId]/page.tsx
src/app/preview/[projectId]/[versionId]/page.tsx
src/components/ui/
src/components/layout/AppShell.tsx
src/lib/env.ts
src/lib/logger.ts
src/test/setup.ts
```

## Task 1: 初始化 Next.js 工程

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: 创建项目依赖**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ai-sdk/openai": "^1.0.0",
    "@mastra/core": "^1.0.0",
    "@prisma/client": "^6.0.0",
    "@sandpack/react": "^2.20.0",
    "ai": "^4.0.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.13.0",
    "tailwind-merge": "^2.5.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: 创建基础页面**

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-normal">VentureFlow</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          从业务问题出发，生成可运行、可分析、可迭代的业务应用。
        </p>
      </section>
    </main>
  )
}
```

- [ ] **Step 3: 运行基础验证**

Run: `npm run typecheck`

Expected: exit code `0`。

- [ ] **Step 4: 提交**

```bash
git add package.json tsconfig.json next.config.ts src/app
git commit -m "chore: initialize next app foundation"
```

## Task 2: 配置 Tailwind 与基础 UI

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `src/app/globals.css`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: 添加 Tailwind token**

```ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: 添加全局样式**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222 24% 12%;
  --muted: 210 20% 96%;
  --muted-foreground: 215 14% 42%;
  --border: 214 18% 88%;
  --primary: 196 72% 34%;
  --primary-foreground: 0 0% 100%;
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

- [ ] **Step 3: 添加 AppShell**

```tsx
import type { ReactNode } from "react"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-sm font-semibold">VentureFlow</span>
        </div>
      </header>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: 运行验证**

Run: `npm run typecheck && npm run build`

Expected: 两个命令 exit code 都为 `0`。

- [ ] **Step 5: 提交**

```bash
git add tailwind.config.ts postcss.config.mjs src/app/globals.css src/components src/lib
git commit -m "chore: add ui foundation"
```

## Task 3: 配置环境变量和测试工具

**Files:**
- Create: `.env.example`
- Create: `src/lib/env.ts`
- Create: `src/lib/logger.ts`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: 定义环境变量**

```bash
DATABASE_URL=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 2: 创建 env 校验**

```ts
import { z } from "zod"

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export const env = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
```

- [ ] **Step 3: 创建 logger**

```ts
type LogLevel = "info" | "warn" | "error"

export function logSystemEvent(level: LogLevel, eventName: string, metadata: Record<string, unknown> = {}) {
  const payload = {
    level,
    eventName,
    metadata,
    createdAt: new Date().toISOString(),
  }

  console[level](JSON.stringify(payload))
}
```

- [ ] **Step 4: 运行验证**

Run: `npm run typecheck && npm run test`

Expected: exit code `0`。

- [ ] **Step 5: 提交**

```bash
git add .env.example src/lib/env.ts src/lib/logger.ts vitest.config.ts src/test/setup.ts playwright.config.ts
git commit -m "chore: configure environment and tests"
```

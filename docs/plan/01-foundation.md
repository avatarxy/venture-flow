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
src/components/ui/（后续 shadcn/ui 组件目录）
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
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ai-sdk/openai": "^3.0.69",
    "@mastra/core": "^1.0.0",
    "@prisma/client": "^6.0.0",
    "@codesandbox/sandpack-react": "^2.20.0",
    "@tailwindcss/postcss": "^4.3.0",
    "ai": "^6.0.201",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "^16.2.9",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "recharts": "^2.13.0",
    "tailwind-merge": "^2.5.0",
    "tailwindcss": "^4.3.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.2.9",
    "prettier": "^3.8.4",
    "prisma": "^6.0.0",
    "typescript": "^6.0.3",
    "vitest": "^4.1.8"
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

## Task 2: 配置 Tailwind v4 与基础 UI

**Files:**
- Create: `postcss.config.mjs`
- Create: `src/app/globals.css`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: 添加 Tailwind v4 PostCSS 配置**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}

export default config
```

- [ ] **Step 2: 添加全局样式和 Tailwind v4 CSS-first token**

```css
@import "tailwindcss";

:root {
  --color-page: #f7f4ed;
  --color-ink: #1c1c1c;
  --color-ink-light: #fcfbf8;
  --color-gold: #c88d2b;
  --color-gold-hover: #a87422;
  --color-muted: #5f5f5d;
  --color-border: #eceae4;
}

@theme inline {
  --color-background: var(--color-page);
  --color-foreground: var(--color-ink);
  --color-muted: rgba(28, 28, 28, 0.04);
  --color-muted-foreground: var(--color-muted);
  --color-border: var(--color-border);
  --color-primary: var(--color-gold);
  --color-primary-foreground: var(--color-ink-light);
}

body {
  background: var(--color-page);
  color: var(--color-ink);
}
```

- [ ] **Step 3: 添加 AppShell**

```tsx
import type { ReactNode } from "react"
import Link from "next/link"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link className="text-sm font-semibold" href="/">
            VentureFlow
          </Link>
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
git add postcss.config.mjs src/app/globals.css src/components src/lib
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
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 2: 创建 env 校验**

```ts
import { z } from "zod"

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export const env = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
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

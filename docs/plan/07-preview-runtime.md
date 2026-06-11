# Preview Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 Sandpack 运行生成应用，支持文件查看、编译错误展示、公开 Preview 和 Usage Event 写入。

**Architecture:** 生成应用文件存储在 GeneratedVersion 中，Workspace Preview 和公开 Preview 都从版本文件加载 Sandpack。生成应用业务数据使用 localStorage，用户行为通过受控 API 写入 Usage Events。

**Tech Stack:** @sandpack/react、Next.js、React、Prisma、TypeScript。

---

## 文件结构

```text
src/components/generated-preview/SandpackRunner.tsx
src/components/generated-preview/PublicPreviewShell.tsx
src/components/workspace/PreviewPanel.tsx
src/app/preview/[projectId]/[versionId]/page.tsx
src/app/api/events/route.ts
src/server/preview/normalize-files.ts
src/server/preview/normalize-files.test.ts
```

## Task 1: 标准化 Sandpack 文件

**Files:**
- Create: `src/server/preview/normalize-files.ts`
- Create: `src/server/preview/normalize-files.test.ts`

- [ ] **Step 1: 写测试**

```ts
import { describe, expect, it } from "vitest"
import { normalizeSandpackFiles } from "./normalize-files"

describe("normalizeSandpackFiles", () => {
  it("adds package entry and preserves generated files", () => {
    const files = normalizeSandpackFiles([{ path: "/App.tsx", content: "export default function App() { return null }" }])

    expect(files["/App.tsx"].code).toContain("export default")
    expect(files["/package.json"].code).toContain("react")
  })
})
```

- [ ] **Step 2: 实现标准化**

```ts
import type { GeneratedFile } from "@/server/contracts"

export function normalizeSandpackFiles(files: GeneratedFile[]) {
  return {
    "/package.json": {
      code: JSON.stringify({
        scripts: { start: "vite --host 0.0.0.0" },
        dependencies: {
          "@vitejs/plugin-react": "latest",
          vite: "latest",
          typescript: "latest",
          react: "latest",
          "react-dom": "latest",
          "lucide-react": "latest",
          recharts: "latest",
        },
        devDependencies: {},
      }, null, 2),
    },
    "/index.html": {
      code: "<div id=\"root\"></div><script type=\"module\" src=\"/src/main.tsx\"></script>",
    },
    "/src/main.tsx": {
      code: "import React from 'react'; import { createRoot } from 'react-dom/client'; import App from '../App'; createRoot(document.getElementById('root')!).render(<App />);",
    },
    ...Object.fromEntries(files.map((file) => [file.path, { code: file.content }])),
  }
}
```

- [ ] **Step 3: 运行测试**

Run: `npm run test -- src/server/preview/normalize-files.test.ts`

Expected: 1 test passes。

## Task 2: 实现 SandpackRunner

**Files:**
- Create: `src/components/generated-preview/SandpackRunner.tsx`

- [ ] **Step 1: 写组件**

```tsx
"use client"

import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider } from "@sandpack/react"
import type { GeneratedFile } from "@/server/contracts"
import { normalizeSandpackFiles } from "@/server/preview/normalize-files"

export function SandpackRunner({ files }: { files: GeneratedFile[] }) {
  return (
    <SandpackProvider template="react" files={normalizeSandpackFiles(files)}>
      <SandpackLayout>
        <SandpackPreview style={{ height: 520 }} />
        <SandpackCodeEditor style={{ height: 520 }} showLineNumbers />
      </SandpackLayout>
    </SandpackProvider>
  )
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 3: 接入 Workspace Preview

**Files:**
- Create: `src/components/workspace/PreviewPanel.tsx`

- [ ] **Step 1: 写 PreviewPanel**

```tsx
import type { GeneratedFile } from "@/server/contracts"
import { SandpackRunner } from "@/components/generated-preview/SandpackRunner"

export function PreviewPanel({ files }: { files: GeneratedFile[] }) {
  if (!files.length) {
    return <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">等待 Builder 生成应用文件。</div>
  }

  return <SandpackRunner files={files} />
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 4: 实现 Usage Event API

**Files:**
- Create: `src/app/api/events/route.ts`

- [ ] **Step 1: 写事件 API**

```ts
import { NextResponse } from "next/server"
import { recordUsageEvent } from "@/server/events/event-repository"

export async function POST(request: Request) {
  const body = await request.json()
  const event = await recordUsageEvent({
    projectId: String(body.projectId),
    versionId: String(body.versionId),
    eventName: String(body.eventName),
    entityName: body.entityName ? String(body.entityName) : undefined,
    metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : undefined,
  })

  return NextResponse.json({ event })
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

## Task 5: 实现公开 Preview 页面

**Files:**
- Modify: `src/app/preview/[projectId]/[versionId]/page.tsx`
- Create: `src/components/generated-preview/PublicPreviewShell.tsx`

- [ ] **Step 1: 写公开壳组件**

```tsx
import type { GeneratedFile } from "@/server/contracts"
import { SandpackRunner } from "./SandpackRunner"

export function PublicPreviewShell({ files }: { files: GeneratedFile[] }) {
  return (
    <main className="min-h-screen bg-background">
      <SandpackRunner files={files} />
    </main>
  )
}
```

- [ ] **Step 2: 写页面加载逻辑**

```tsx
import { PublicPreviewShell } from "@/components/generated-preview/PublicPreviewShell"
import { prisma } from "@/server/db/client"

export default async function PublicPreviewPage({ params }: { params: Promise<{ projectId: string; versionId: string }> }) {
  const { projectId, versionId } = await params
  const version = await prisma.generatedVersion.findFirst({
    where: { id: versionId, projectId },
  })

  if (!version) {
    return <main className="p-6">Preview not found</main>
  }

  return <PublicPreviewShell files={version.files as never} />
}
```

- [ ] **Step 3: 运行验证**

Run: `npm run typecheck && npm run build`

Expected: typecheck 和 build 都通过。

- [ ] **Step 4: 提交**

```bash
git add src/components/generated-preview src/components/workspace/PreviewPanel.tsx src/app/preview src/app/api/events src/server/preview
git commit -m "feat: add sandpack preview runtime"
```


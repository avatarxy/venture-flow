# Data Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Project、Generation、GeneratedVersion、AgentState、UsageEvent 的持久化能力。

**Architecture:** 使用 Prisma 管理 Supabase PostgreSQL Schema，并通过 repository 函数隔离数据访问。业务层不直接拼接 Prisma 查询。

**Tech Stack:** Prisma、Supabase PostgreSQL、TypeScript、Vitest。

---

## 文件结构

```text
prisma/schema.prisma
src/server/db/client.ts
src/server/projects/project-repository.ts
src/server/projects/project-repository.test.ts
src/server/versions/version-repository.ts
src/server/events/event-repository.ts
src/server/agent-state/agent-state-repository.ts
```

## Task 1: 定义 Prisma Schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: 写入数据模型**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ProjectStatus {
  DRAFT
  RUNNING
  NEEDS_REVIEW
  COMPLETED
  FAILED
}

enum GenerationType {
  STRATEGY
  BLUEPRINT
  BUILD
  REVIEW
  OPTIMIZATION
  IMPROVEMENT
}

enum GenerationStatus {
  RUNNING
  COMPLETED
  FAILED
}

enum PublishStatus {
  DRAFT
  LIVE
  FAILED
}

model Project {
  id               String             @id @default(cuid())
  name             String
  originalProblem  String
  status           ProjectStatus      @default(DRAFT)
  strategy         Json?
  blueprint        Json?
  currentVersionId String?            @unique
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  generations      Generation[]
  versions         GeneratedVersion[] @relation("ProjectVersions")
  currentVersion   GeneratedVersion?  @relation("ProjectCurrentVersion", fields: [currentVersionId], references: [id], onDelete: SetNull)
  usageEvents      UsageEvent[]
  agentState       AgentState?
}

model Generation {
  id           String           @id @default(cuid())
  projectId    String
  type         GenerationType
  input        Json
  output       Json?
  status       GenerationStatus
  errorMessage String?
  createdAt    DateTime         @default(now())
  project      Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, createdAt])
}

model GeneratedVersion {
  id                String        @id @default(cuid())
  projectId         String
  version           Int
  files             Json
  blueprintSnapshot Json
  changeSummary     String
  publishStatus     PublishStatus @default(DRAFT)
  createdAt         DateTime      @default(now())
  project           Project       @relation("ProjectVersions", fields: [projectId], references: [id], onDelete: Cascade)
  currentForProject Project?      @relation("ProjectCurrentVersion")
  usageEvents       UsageEvent[]

  @@unique([projectId, version])
  @@index([projectId, createdAt])
}

model AgentState {
  projectId      String   @id
  status         String
  currentPlan    Json
  currentStep    Int      @default(0)
  toolCalls      Json
  buildAttempts  Int      @default(0)
  repairAttempts Int      @default(0)
  totalTokens    Int      @default(0)
  updatedAt      DateTime @updatedAt
  project        Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model UsageEvent {
  id         String           @id @default(cuid())
  projectId  String
  versionId  String
  eventName  String
  entityName String?
  metadata   Json?
  createdAt  DateTime         @default(now())
  project    Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  version    GeneratedVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)

  @@index([projectId, createdAt])
  @@index([versionId, createdAt])
  @@index([eventName, createdAt])
}
```

- [ ] **Step 2: 生成 Prisma Client**

Run: `npx prisma generate`

Expected: 输出包含 `Generated Prisma Client`。

- [ ] **Step 3: 创建迁移**

Run: `npx prisma migrate dev --name init`

Expected: 数据库创建 5 张主表和 4 个枚举。

- [ ] **Step 4: 提交**

```bash
git add prisma
git commit -m "feat: add ventureflow data model"
```

## Task 2: 创建数据库客户端

**Files:**
- Create: `src/server/db/client.ts`

- [ ] **Step 1: 写入 Prisma 单例**

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: exit code `0`。

- [ ] **Step 3: 提交**

```bash
git add src/server/db/client.ts
git commit -m "chore: add prisma client"
```

## Task 3: 实现 Project Repository

**Files:**
- Create: `src/server/projects/project-repository.ts`
- Create: `src/server/projects/project-repository.test.ts`

- [ ] **Step 1: 写 repository 测试**

```ts
import { describe, expect, it, vi } from "vitest"
import { createProjectName, validateProblemInput } from "./project-repository"

describe("project repository helpers", () => {
  it("rejects short business problems", () => {
    expect(() => validateProblemInput("太短")).toThrow("业务问题至少需要 20 个字符")
  })

  it("creates a readable project name", () => {
    expect(createProjectName("我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进")).toBe("销售团队线索管理")
  })
})
```

- [ ] **Step 2: 实现 helper 与 repository**

```ts
import { prisma } from "@/server/db/client"

export function validateProblemInput(problem: string) {
  if (problem.trim().length < 20) {
    throw new Error("业务问题至少需要 20 个字符")
  }
}

export function createProjectName(problem: string) {
  if (problem.includes("销售") || problem.includes("线索")) {
    return "销售团队线索管理"
  }

  if (problem.includes("反馈")) {
    return "客户反馈管理"
  }

  if (problem.includes("内容")) {
    return "内容运营管理"
  }

  return "业务问题解决方案"
}

export async function createProject(originalProblem: string) {
  validateProblemInput(originalProblem)

  return prisma.project.create({
    data: {
      name: createProjectName(originalProblem),
      originalProblem,
      status: "DRAFT",
    },
  })
}

export async function getProject(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      agentState: true,
      versions: { orderBy: { version: "desc" } },
    },
  })
}
```

- [ ] **Step 3: 运行测试**

Run: `npm run test -- src/server/projects/project-repository.test.ts`

Expected: 2 tests pass。

- [ ] **Step 4: 提交**

```bash
git add src/server/projects
git commit -m "feat: add project repository"
```

## Task 4: 实现版本、事件和 AgentState Repository

**Files:**
- Create: `src/server/versions/version-repository.ts`
- Create: `src/server/events/event-repository.ts`
- Create: `src/server/agent-state/agent-state-repository.ts`

- [ ] **Step 1: 写版本 repository**

```ts
import type { Prisma } from "@prisma/client"
import { Prisma as PrismaRuntime } from "@prisma/client"
import { prisma } from "@/server/db/client"

export type GeneratedVersionFile = {
  path: string
  content: string
}

const MAX_VERSION_CREATE_RETRIES = 3

function isRetryableVersionCreateError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined

  return code === "P2002" || code === "P2034"
}

export async function createGeneratedVersion(input: {
  projectId: string
  files: GeneratedVersionFile[]
  blueprintSnapshot: Prisma.InputJsonValue
  changeSummary: string
}) {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_VERSION_CREATE_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const latest = await tx.generatedVersion.findFirst({
            where: { projectId: input.projectId },
            orderBy: { version: "desc" },
          })

          const version = (latest?.version ?? 0) + 1

          const generatedVersion = await tx.generatedVersion.create({
            data: {
              projectId: input.projectId,
              version,
              files: input.files,
              blueprintSnapshot: input.blueprintSnapshot,
              changeSummary: input.changeSummary,
            },
          })

          await tx.project.update({
            where: { id: input.projectId },
            data: { currentVersionId: generatedVersion.id },
          })

          return generatedVersion
        },
        {
          isolationLevel: PrismaRuntime.TransactionIsolationLevel.Serializable,
        },
      )
    } catch (error) {
      lastError = error

      if (isRetryableVersionCreateError(error)) {
        continue
      }

      throw error
    }
  }

  throw lastError
}
```

- [ ] **Step 2: 写事件 repository**

```ts
import { prisma } from "@/server/db/client"

const allowedEvents = new Set([
  "app_opened",
  "entity_created",
  "entity_updated",
  "entity_deleted",
  "filter_used",
  "search_used",
  "status_changed",
  "primary_action_clicked",
])

export async function recordUsageEvent(input: {
  projectId: string
  versionId: string
  eventName: string
  entityName?: string
  metadata?: Record<string, unknown>
}) {
  if (!allowedEvents.has(input.eventName)) {
    throw new Error(`Unsupported usage event: ${input.eventName}`)
  }

  return prisma.usageEvent.create({
    data: input,
  })
}
```

- [ ] **Step 3: 写 AgentState repository**

```ts
import type { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/server/db/client"

const persistedPlanItemSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["pending", "running", "completed", "failed"]),
})

const persistedToolCallSchema = z.object({
  toolName: z.string().min(1),
  reasoningSummary: z.string(),
  argumentsSummary: z.string(),
  resultSummary: z.string().optional(),
  status: z.enum(["running", "completed", "failed"]),
  startedAt: z.string().min(1),
  endedAt: z.string().optional(),
  errorMessage: z.string().optional(),
  tokenUsage: z.number().int().nonnegative().default(0),
})

const persistedAgentStateSchema = z.object({
  projectId: z.string().min(1),
  status: z.enum(["planning", "executing", "waiting_for_user", "completed", "failed"]),
  currentPlan: z.array(persistedPlanItemSchema),
  currentStep: z.number().int().nonnegative(),
  toolCalls: z.array(persistedToolCallSchema),
  buildAttempts: z.number().int().nonnegative(),
  repairAttempts: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
})

export type PersistedAgentState = z.infer<typeof persistedAgentStateSchema>

export function validateAgentStateForPersistence(state: unknown): PersistedAgentState {
  return persistedAgentStateSchema.parse(state)
}

export async function saveAgentState(state: unknown) {
  const parsedState = validateAgentStateForPersistence(state)

  return prisma.agentState.upsert({
    where: { projectId: parsedState.projectId },
    create: {
      projectId: parsedState.projectId,
      status: parsedState.status,
      currentPlan: parsedState.currentPlan as Prisma.InputJsonValue,
      currentStep: parsedState.currentStep,
      toolCalls: parsedState.toolCalls as Prisma.InputJsonValue,
      buildAttempts: parsedState.buildAttempts,
      repairAttempts: parsedState.repairAttempts,
      totalTokens: parsedState.totalTokens,
    },
    update: {
      status: parsedState.status,
      currentPlan: parsedState.currentPlan as Prisma.InputJsonValue,
      currentStep: parsedState.currentStep,
      toolCalls: parsedState.toolCalls as Prisma.InputJsonValue,
      buildAttempts: parsedState.buildAttempts,
      repairAttempts: parsedState.repairAttempts,
      totalTokens: parsedState.totalTokens,
    },
  })
}
```

- [ ] **Step 4: 运行验证**

Run: `npm run typecheck`

Expected: exit code `0`。

- [ ] **Step 5: 提交**

```bash
git add src/server/versions src/server/events src/server/agent-state
git commit -m "feat: add persistence repositories"
```

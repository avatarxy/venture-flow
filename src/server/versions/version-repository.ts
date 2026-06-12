import type { Prisma } from "@prisma/client"
import { Prisma as PrismaRuntime } from "@prisma/client"
import { buildOutputSchema } from "@/server/contracts"
import { prisma } from "@/server/db/client"
import { prepareGeneratedBuild } from "@/server/tools/format-generated-build"

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
  publishStatus?: "DRAFT" | "LIVE" | "FAILED"
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
              publishStatus: input.publishStatus ?? "DRAFT",
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

export async function publishCurrentBuildPreview(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { agentState: true },
  })

  if (!project?.agentState?.build) {
    throw new Error("当前项目还没有可发布的生成应用")
  }

  const build = await prepareGeneratedBuild(buildOutputSchema.parse(project.agentState.build))

  return createGeneratedVersion({
    projectId,
    files: build.files,
    blueprintSnapshot: (project.agentState.blueprint ?? {}) as Prisma.InputJsonValue,
    changeSummary: "发布在线预览",
    publishStatus: "LIVE",
  })
}

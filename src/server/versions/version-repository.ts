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

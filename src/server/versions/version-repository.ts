import type { Prisma } from "@prisma/client"
import { prisma } from "@/server/db/client"

export type GeneratedVersionFile = {
  path: string
  content: string
}

export async function createGeneratedVersion(input: {
  projectId: string
  files: GeneratedVersionFile[]
  blueprintSnapshot: Prisma.InputJsonValue
  changeSummary: string
}) {
  const latest = await prisma.generatedVersion.findFirst({
    where: { projectId: input.projectId },
    orderBy: { version: "desc" },
  })

  const version = (latest?.version ?? 0) + 1

  return prisma.generatedVersion.create({
    data: {
      projectId: input.projectId,
      version,
      files: input.files,
      blueprintSnapshot: input.blueprintSnapshot,
      changeSummary: input.changeSummary,
    },
  })
}

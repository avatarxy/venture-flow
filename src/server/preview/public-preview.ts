import { z } from "zod"
import { appEntrypointPath, generatedFileSchema, type GeneratedFile } from "@/server/contracts"
import { prisma } from "@/server/db/client"

const generatedFilesSchema = z.array(generatedFileSchema).min(1)

type PublicPreviewVersion = {
  id: string
  projectId: string
  files: GeneratedFile[]
}

export async function getPublicPreviewVersion(input: { projectId: string; versionId: string }): Promise<PublicPreviewVersion | null> {
  const version = await prisma.generatedVersion.findFirst({
    where: {
      id: input.versionId,
      projectId: input.projectId,
      publishStatus: "LIVE",
    },
    select: {
      id: true,
      projectId: true,
      files: true,
    },
  })

  if (!version) {
    return null
  }

  const parsedFiles = generatedFilesSchema.safeParse(version.files)

  if (!parsedFiles.success || !parsedFiles.data.some((file) => file.path === appEntrypointPath)) {
    return null
  }

  return {
    id: version.id,
    projectId: version.projectId,
    files: parsedFiles.data,
  }
}

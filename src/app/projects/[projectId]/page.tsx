import { notFound } from "next/navigation"
import { ProjectWorkspace } from "@/components/workspace/ProjectWorkspace"
import { generatedFileSchema, type GeneratedFile } from "@/server/contracts"
import { getChatMessages } from "@/server/messages/message-repository"
import { getProject } from "@/server/projects/project-repository"

type ProjectPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  const chatMessages = await getChatMessages(project.id)
  const initialMessages = chatMessages.map((message) => ({
    id: message.id,
    role: message.role === "user" ? "user" as const : "assistant" as const,
    metadata: {
      ...(typeof message.metadata === "object" && message.metadata !== null && !Array.isArray(message.metadata) ? message.metadata : {}),
      type: message.type,
    },
    parts: [{ type: "text" as const, text: message.content }],
  }))
  const initialPreviewFiles = extractGeneratedFiles(project.versions[0]?.files ?? project.agentState?.build)

  return (
    <ProjectWorkspace
      projectId={project.id}
      projectName={project.name}
      originalProblem={project.originalProblem}
      initialMessages={initialMessages}
      initialPreviewFiles={initialPreviewFiles}
    />
  )
}

function extractGeneratedFiles(value: unknown): GeneratedFile[] {
  const files =
    typeof value === "object" && value !== null && "files" in value
      ? (value as { files?: unknown }).files
      : value

  if (!Array.isArray(files)) {
    return []
  }

  return files
    .map((file) => generatedFileSchema.safeParse(file))
    .filter((result) => result.success)
    .map((result) => result.data)
}

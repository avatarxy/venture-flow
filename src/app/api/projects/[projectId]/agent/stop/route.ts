import { NextResponse } from "next/server"
import { getProject } from "@/server/projects/project-repository"

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ projectId, status: "stopped" })
}

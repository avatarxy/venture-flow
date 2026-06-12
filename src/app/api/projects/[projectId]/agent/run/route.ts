import { NextResponse } from "next/server"
import { saveAgentState } from "@/server/agent-state/agent-state-repository"
import { createInitialAgentState } from "@/server/agent/state-factory"
import { getProject } from "@/server/projects/project-repository"

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const agentState = project.agentState ?? (await saveAgentState(createInitialAgentState(project.id, project.originalProblem)))

  return NextResponse.json({ projectId, status: "accepted", agentStateStatus: agentState.status })
}

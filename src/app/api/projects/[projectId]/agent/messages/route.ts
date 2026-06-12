import { NextResponse } from "next/server"
import { createInitialAgentState } from "@/server/agent/state-factory"
import { saveAgentState } from "@/server/agent-state/agent-state-repository"
import { saveChatMessage } from "@/server/messages/message-repository"
import { createVentureFlowToolSuite } from "@/server/tools/tool-suite"
import { getChatMessages } from "@/server/messages/message-repository"
import { getProject } from "@/server/projects/project-repository"
import { handleUserMessage } from "@/server/agent/supervisor"
import { agentStateSchema } from "@/server/contracts"
import type { AgentState } from "@/server/contracts"

/**
 * 将 Prisma 返回的 AgentState (Json 类型) 标准化为合约 AgentState
 */
function normalizeState(raw: unknown): AgentState {
  return agentStateSchema.parse(raw ?? {})
}

/**
 * POST — 发送用户消息，返回 Agent 响应
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  const { message } = await request.json()

  if (!message || typeof message !== "string" || message.trim().length < 2) {
    return NextResponse.json({ error: "消息不能为空" }, { status: 400 })
  }

  const project = await getProject(projectId)
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  // 确保 AgentState 存在
  const initialState = project.agentState
    ? normalizeState(project.agentState)
    : createInitialAgentState(project.id, project.originalProblem)

  if (!project.agentState) {
    await saveAgentState(initialState)
  }

  // 工具注册表 + 决策函数（使用 Mastra supervisor agent）
  const toolRegistry = createVentureFlowToolSuite()

  // 处理用户消息
  const response = await handleUserMessage(
    projectId,
    message.trim(),
    async (id) => {
      const p = await getProject(id)
      if (!p?.agentState) {
        return createInitialAgentState(id, p?.originalProblem ?? "")
      }
      return normalizeState(p.agentState)
    },
    async (st) => {
      await saveAgentState(st)
    },
    async (state) => {
      // 使用 Mastra supervisor agent 做决策
      const result = await (
        await import("@/server/mastra/agents/supervisor-agent")
      ).supervisorAgent.generate(
        `当前状态：${JSON.stringify({ status: state.status, currentStep: state.currentStep, currentPlan: state.currentPlan, hasStrategy: !!state.strategy, hasBlueprint: !!state.blueprint, hasBuild: !!state.build, hasReview: !!state.review })}\n\n决定下一步行动。`,
      )
      try {
        return JSON.parse(result.text)
      } catch {
        return { type: "finish", reasoningSummary: "Unable to decide next action" }
      }
    },
    toolRegistry,
  )

  for (const message of response.messages) {
    await saveChatMessage({
      projectId,
      role: message.role,
      type: message.type,
      content: message.content,
      metadata: message.metadata ?? null,
    })
  }

  return NextResponse.json({
    agentMessage: response.message,
    agentMessages: response.messages,
    agentStatus: response.status,
    agentState: {
      currentStep: response.state.currentStep,
      currentPlan: response.state.currentPlan,
      status: response.state.status,
    },
  })
}

/**
 * GET — 获取对话历史
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  const messages = await getChatMessages(projectId)
  return NextResponse.json({ messages })
}

import { NextResponse } from "next/server"
import { createInitialAgentState } from "@/server/agent/state-factory"
import { saveAgentState } from "@/server/agent-state/agent-state-repository"
import { saveChatMessage } from "@/server/messages/message-repository"
import { createVentureFlowToolSuite } from "@/server/tools/tool-suite"
import { getChatMessages } from "@/server/messages/message-repository"
import { getProject } from "@/server/projects/project-repository"
import { handleUserMessage, handleUserMessageStream, type StreamEvent } from "@/server/agent/supervisor"
import { agentStateSchema } from "@/server/contracts"
import type { AgentState } from "@/server/contracts"

function normalizeState(raw: unknown): AgentState {
  return agentStateSchema.parse(raw ?? {})
}

function encodeSSE(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

/**
 * POST — 流式 SSE 响应，实时推送 Agent 思考过程
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  const { message, stream: preferStream } = await request.json().catch(() => ({ message: "", stream: true }))

  if (!message || typeof message !== "string" || message.trim().length < 2) {
    return NextResponse.json({ error: "消息不能为空" }, { status: 400 })
  }

  const project = await getProject(projectId)
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const initialState = project.agentState
    ? normalizeState(project.agentState)
    : createInitialAgentState(project.id, project.originalProblem)

  if (!project.agentState) {
    await saveAgentState(initialState)
  }

  const toolRegistry = createVentureFlowToolSuite()

  // 支持 `?stream=false` 回退到旧的非流式模式
  const { searchParams } = new URL(request.url)
  if (searchParams.get("stream") === "false" || preferStream === false) {
    const response = await handleUserMessage(
      projectId,
      message.trim(),
      async (id) => {
        const p = await getProject(id)
        if (!p?.agentState) return createInitialAgentState(id, p?.originalProblem ?? "")
        return normalizeState(p.agentState)
      },
      async (st) => { await saveAgentState(st) },
      async (state) => {
        const result = await (
          await import("@/server/mastra/agents/supervisor-agent")
        ).supervisorAgent.generate(
          `当前状态：${JSON.stringify({ status: state.status, currentStep: state.currentStep, currentPlan: state.currentPlan, hasStrategy: !!state.strategy, hasBlueprint: !!state.blueprint, hasBuild: !!state.build, hasReview: !!state.review })}\n\n决定下一步行动。`,
        )
        try { return JSON.parse(result.text) }
        catch { return { type: "finish", reasoningSummary: "Unable to decide next action" } }
      },
      toolRegistry,
    )

    for (const msg of response.messages) {
      await saveChatMessage({
        projectId,
        role: msg.role,
        type: msg.type,
        content: msg.content,
        metadata: msg.metadata ?? null,
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

  // ── 流式模式 ──
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const emit = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(encodeSSE(event)))
      }

      try {
        await handleUserMessageStream(
          projectId,
          message.trim(),
          async (id) => {
            const p = await getProject(id)
            if (!p?.agentState) return createInitialAgentState(id, p?.originalProblem ?? "")
            return normalizeState(p.agentState)
          },
          async (st) => { await saveAgentState(st) },
          toolRegistry,
          emit,
        )

        controller.close()
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown agent error"
        emit({ type: "error", message: errMsg })
        emit({ type: "done", status: "failed" })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
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

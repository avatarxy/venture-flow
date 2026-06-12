import { Prisma } from "@prisma/client"
import { prisma } from "@/server/db/client"

export interface ChatMessageInput {
  projectId: string
  role: string
  type: string
  content: string
  metadata?: Record<string, unknown> | null
}

function shouldUseDemoProject(projectId: string) {
  return process.env.VENTUREFLOW_ENABLE_DEMO_PROJECT === "1" && projectId === "demo-project"
}

/**
 * 保存一条对话消息到数据库
 */
export async function saveChatMessage(message: ChatMessageInput) {
  return prisma.chatMessage.create({
    data: {
      projectId: message.projectId,
      role: message.role,
      type: message.type,
      content: message.content,
      metadata: (message.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  })
}

/**
 * 按时间正序获取项目的完整对话历史
 */
export async function getChatMessages(projectId: string) {
  if (shouldUseDemoProject(projectId)) {
    return []
  }

  return prisma.chatMessage.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  })
}

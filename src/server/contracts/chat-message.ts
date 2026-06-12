import { z } from "zod"

/**
 * 对话消息角色
 * - user: 用户发送
 * - agent: Agent 生成
 * - system: 系统通知
 */
export const chatMessageRoleSchema = z.enum(["user", "agent", "system"])

/**
 * 对话消息类型
 * user-text: 普通用户消息
 * agent-strategy: Strategy 分析结果
 * agent-blueprint: Product Blueprint
 * agent-build: 构建完成通知
 * agent-review: 审查结果
 * agent-error: 错误信息
 * agent-question: Agent 主动提问
 * agent-thinking: Agent 思考中
 * system-info: 系统通知
 */
export const chatMessageTypeSchema = z.enum([
  "user-text",
  "agent-strategy",
  "agent-blueprint",
  "agent-build",
  "agent-review",
  "agent-error",
  "agent-question",
  "agent-thinking",
  "system-info",
])

export const chatMessageSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  role: chatMessageRoleSchema,
  type: chatMessageTypeSchema,
  content: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  createdAt: z.string().min(1),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type ChatMessageRole = z.infer<typeof chatMessageRoleSchema>
export type ChatMessageType = z.infer<typeof chatMessageTypeSchema>

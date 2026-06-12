import { z } from "zod"

/**
 * 用户意图 Schema
 * 将用户的自然语言消息解析为结构化的 Agent 行动指令
 */
export const userIntentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("continue"),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("modify_blueprint"),
    instruction: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("redo_blueprint"),
    instruction: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("regenerate_page"),
    targetPage: z.string().min(1),
    instruction: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("skip_to_build"),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("accept"),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("unknown"),
    rawMessage: z.string(),
    confidence: z.number().min(0).max(1),
  }),
])

export type UserIntent = z.infer<typeof userIntentSchema>

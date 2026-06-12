import { generateStructuredObject } from "@/server/ai/generate-structured"
import { userIntentSchema } from "@/server/contracts/user-intent"
import type { UserIntent } from "@/server/contracts/user-intent"

/**
 * 用户意图解析提示词
 * 根据当前 Agent 状态动态生成上下文信息
 */
function createUserIntentPrompt(): string {
  return "你是 VentureFlow 的意图解析器。根据用户消息判断意图类型。"

  // 意图规则在 system 中通过结构化输出来约束
}

/**
 * 通过 LLM 解析用户自然语言意图
 * 将 "再加一个 Contact 实体" 映射为 { type: "modify_blueprint", instruction: "再加一个 Contact 实体" }
 */
export async function parseUserIntent(
  userMessage: string,
  _context: Record<string, unknown> = {},
): Promise<UserIntent> {
  try {
    return await generateStructuredObject({
      schema: userIntentSchema,
      system: `你是 VentureFlow 的意图解析器。

根据用户消息，判断意图类型并提取关键信息:

1. continue — 用户表示可以继续（"继续"、"好的"、"go on"、"下一步"、"ok"）
2. modify_blueprint — 用户要修改 Blueprint（"加一个实体"、"去掉这个页面"、"改成..."），提取 instruction
3. redo_blueprint — 用户要重做 Blueprint（"全部重做"、"Blueprint 不对"、"重新设计"），提取 instruction
4. regenerate_page — 用户要重新生成某个页面（"搜索功能不好用"、"仪表盘样式改一下"），提取 targetPage 和 instruction
5. skip_to_build — 用户要跳过当前步骤直接生成（"直接生成"、"跳过分析"、"先看看效果"）
6. accept — 用户确认完成（"可以了"、"就这样"、"够了"、"完成"、"发布"）
7. unknown — 无法识别意图，rawMessage 包含原始消息

每条意图都附带 confidence (0-1)，表示识别的确信度。`,
      prompt: JSON.stringify({ userMessage, context: _context }, null, 2),
    })
  } catch {
    // 解析失败时返回 unknown
    return {
      type: "unknown",
      rawMessage: userMessage,
      confidence: 0,
    }
  }
}

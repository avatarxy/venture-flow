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

function normalizeUserMessage(userMessage: string) {
  return userMessage.trim().toLowerCase()
}

/**
 * 高频短指令必须稳定可用，不能因为模型解析失败让用户点击后没有反馈。
 */
type IntentContext = {
  status?: unknown
  hasBlueprint?: unknown
  hasBuild?: unknown
  currentStep?: unknown
}

function hasGeneratedBuild(context: IntentContext) {
  return context.hasBuild === true
}

function looksLikeApplicationError(text: string) {
  return (
    /(console error|error type|error message|something went wrong|unknown character|runtime error|build error|compile error|syntaxerror|typeerror|referenceerror)/i.test(text) ||
    /(报错|异常|白屏|无法预览|不能预览|预览失败|编译失败|运行失败|控制台)/.test(text)
  )
}

function looksLikeApplicationChange(text: string) {
  return (
    /(新增|增加|添加|加一个|加个|生成|创建|改一下|修改|调整|删除|去掉|换成|改成|优化).*(功能|页面|tab|按钮|文案|字段|列表|表单|详情|仪表盘|dashboard|page|feature|copy)/i.test(text) ||
    /(功能|页面|按钮|文案|列表|表单|详情|仪表盘|dashboard|page|feature|copy).*(新增|增加|添加|修改|调整|删除|去掉|换成|改成|优化)/i.test(text)
  )
}

function inferTargetPage(userMessage: string) {
  const text = userMessage.trim()
  const quoted = text.match(/[「“"]([^」”"]{1,40})[」”"]/)
  if (quoted?.[1]) return quoted[1]

  const pageMatch = text.match(/([\u4e00-\u9fa5A-Za-z0-9_-]{1,30})(?:页面|页|Page|page)/)
  if (pageMatch?.[1]) {
    const pageName = pageMatch[1]
      .replace(/^(新增|增加|添加|加一个|加个|生成|创建|修改|调整|改一下)(一个|个)?/, "")
      .trim()
    return `${pageName || pageMatch[1]}页面`
  }

  if (/仪表盘|dashboard/i.test(text)) return "仪表盘"
  if (/客户|customer/i.test(text)) return "客户页面"
  if (/线索|lead/i.test(text)) return "线索页面"
  return "应用"
}

function parseDeterministicIntent(userMessage: string, context: IntentContext = {}): UserIntent | null {
  const text = normalizeUserMessage(userMessage)

  if (!text) return null

  if (
    /^(继续|下一步|好的|好|可以|ok|okay|go on|continue)$/.test(text) ||
    /继续.*(blueprint|蓝图|应用|生成)/i.test(text) ||
    /^(生成|创建|做出|产出).*(blueprint|蓝图)$/i.test(text)
  ) {
    return { type: "continue", confidence: 1 }
  }

  if (/^(确认|可以了|就这样|够了|完成|发布)$/.test(text) || /确认.*(完成|通过|就这样)/.test(text)) {
    return { type: "accept", confidence: 1 }
  }

  if (/^(直接|跳过|先).*(生成应用|生成|看看效果|预览)/.test(text)) {
    return { type: "skip_to_build", confidence: 1 }
  }

  if (hasGeneratedBuild(context) && looksLikeApplicationError(userMessage)) {
    return { type: "repair_application", instruction: userMessage.trim(), confidence: 0.95 }
  }

  if (hasGeneratedBuild(context) && looksLikeApplicationChange(userMessage)) {
    return {
      type: "regenerate_page",
      targetPage: inferTargetPage(userMessage),
      instruction: userMessage.trim(),
      confidence: 0.9,
    }
  }

  if (/(重新|重做|再来).*(blueprint|蓝图|方案|设计)/i.test(text)) {
    return { type: "redo_blueprint", instruction: userMessage.trim(), confidence: 0.95 }
  }

  if (/(修改|调整|改一下|加一个|增加|删除|去掉).*(blueprint|蓝图|实体|页面|字段|流程)/i.test(text)) {
    return { type: "modify_blueprint", instruction: userMessage.trim(), confidence: 0.95 }
  }

  if (/(重新生成|重做|调整|修改).*(页面|仪表盘|列表|表单|详情)/.test(text)) {
    return {
      type: "regenerate_page",
      targetPage: "目标页面",
      instruction: userMessage.trim(),
      confidence: 0.8,
    }
  }

  return null
}

/**
 * 通过 LLM 解析用户自然语言意图
 * 将 "再加一个 Contact 实体" 映射为 { type: "modify_blueprint", instruction: "再加一个 Contact 实体" }
 */
export async function parseUserIntent(
  userMessage: string,
  _context: Record<string, unknown> = {},
): Promise<UserIntent> {
  const deterministicIntent = parseDeterministicIntent(userMessage, _context)
  if (deterministicIntent) {
    return deterministicIntent
  }

  try {
    return await generateStructuredObject({
      schema: userIntentSchema,
      system: `你是 VentureFlow 的意图解析器。

根据用户消息，判断意图类型并提取关键信息:

1. continue — 用户表示可以继续（"继续"、"好的"、"go on"、"下一步"、"ok"）
2. modify_blueprint — 用户要修改 Blueprint（"加一个实体"、"去掉这个页面"、"改成..."），提取 instruction
3. redo_blueprint — 用户要重做 Blueprint（"全部重做"、"Blueprint 不对"、"重新设计"），提取 instruction
4. regenerate_page — 用户要重新生成某个页面（"搜索功能不好用"、"仪表盘样式改一下"），提取 targetPage 和 instruction
5. repair_application — 已生成应用后，用户粘贴 Console Error、编译错误、预览错误、运行异常或报错截图文字，提取完整 instruction
6. skip_to_build — 用户要跳过当前步骤直接生成（"直接生成"、"跳过分析"、"先看看效果"）
7. accept — 用户确认完成（"可以了"、"就这样"、"够了"、"完成"、"发布"）
8. unknown — 无法识别意图，rawMessage 包含原始消息

如果 context.hasBuild=true：
- 用户要求新增功能、页面、Tab、字段，或修改页面、按钮、文案、样式，应优先判为 regenerate_page，而不是 modify_blueprint。
- 用户粘贴错误堆栈、Console Error、Something went wrong、Unknown character 等，应判为 repair_application。

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

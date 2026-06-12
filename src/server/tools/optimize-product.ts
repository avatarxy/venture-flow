import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { optimizationOutputSchema, productBlueprintSchema } from "@/server/contracts"
import { jsonValueSchema } from "@/server/contracts/json"

export const optimizeProductInputSchema = z.object({
  blueprint: productBlueprintSchema,
  usageEvents: z.array(z.record(z.string(), jsonValueSchema)),
})

export async function optimizeProduct(input: z.infer<typeof optimizeProductInputSchema>) {
  if (input.usageEvents.length === 0) {
    return {
      findings: [
        {
          title: "真实使用数据不足",
          evidence: ["Usage Events 数量为 0"],
          inference: "当前无法基于真实用户行为判断产品改进优先级。",
        },
      ],
      recommendations: [
        {
          title: "继续收集真实使用数据",
          description: "先发布当前版本并收集访问、创建、搜索、筛选和状态变更等事件，再生成优化建议。",
          priority: "low" as const,
          evidence: ["Usage Events 数量为 0"],
          inference: "缺少真实行为样本时，优化建议只能作为下一步数据采集任务。",
          expectedImpact: "避免基于无证据推断改动产品。",
          targetComponents: ["Usage Analytics"],
        },
      ],
    }
  }

  return generateStructuredObject({
    schema: optimizationOutputSchema,
    system:
      "你是 VentureFlow 的 Growth Agent。只能基于真实 Usage Events 或明确标识的数据提出发现和优化建议，必须给出 evidence 与 inference。",
    prompt: JSON.stringify(input, null, 2),
  })
}

export const optimizeProductTool = createTool({
  id: "optimize_product",
  description: "基于 Usage Events 和 Product Blueprint 生成优化建议。",
  strict: true,
  inputSchema: optimizeProductInputSchema,
  outputSchema: optimizationOutputSchema,
  execute: async (inputData) => optimizeProduct(optimizeProductInputSchema.parse(inputData)),
})

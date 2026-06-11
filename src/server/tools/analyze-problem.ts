import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { strategyOutputSchema } from "@/server/contracts"

export const analyzeProblemInputSchema = z.object({
  problem: z.string().min(20),
})

export async function analyzeProblem(problem: string) {
  return generateStructuredObject({
    schema: strategyOutputSchema,
    system:
      "你是 VentureFlow 的 Strategy Agent。请从业务问题出发，输出事实、假设、目标用户、痛点、期望结果、成功指标和推荐应用模式。只输出符合 Schema 的结构化对象。",
    prompt: problem,
  })
}

export const analyzeProblemTool = createTool({
  id: "analyze_problem",
  description: "分析用户业务问题，生成 Strategy 结构化结果。",
  strict: true,
  inputSchema: analyzeProblemInputSchema,
  outputSchema: strategyOutputSchema,
  execute: async (inputData) => analyzeProblem(inputData.problem),
})

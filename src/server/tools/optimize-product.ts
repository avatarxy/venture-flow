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

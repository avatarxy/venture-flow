import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { productBlueprintSchema, strategyOutputSchema } from "@/server/contracts"

export const createBlueprintInputSchema = z.object({
  originalProblem: z.string().min(20),
  strategy: strategyOutputSchema,
})

export async function createBlueprint(input: z.infer<typeof createBlueprintInputSchema>) {
  return generateStructuredObject({
    schema: productBlueprintSchema,
    system:
      "你是 VentureFlow 的 Product Blueprint Agent。请把 Strategy 转成可生成应用的产品蓝图，严格控制在 MVP 能力边界内，实体不超过 4 个，页面不超过 5 个。",
    prompt: JSON.stringify(input, null, 2),
  })
}

export const createBlueprintTool = createTool({
  id: "create_blueprint",
  description: "基于 Strategy 生成可校验、可生成应用的 Product Blueprint。",
  strict: true,
  inputSchema: createBlueprintInputSchema,
  outputSchema: productBlueprintSchema,
  execute: async (inputData) => createBlueprint(inputData),
})

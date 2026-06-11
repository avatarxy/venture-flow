import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import type { ProductBlueprint } from "@/server/contracts"
import { buildOutputSchema, productBlueprintSchema } from "@/server/contracts"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { createAppBuilderPrompt } from "@/server/generation/prompts/app-builder-prompt"

export async function generateApplication(blueprint: ProductBlueprint) {
  return generateStructuredObject({
    schema: buildOutputSchema,
    system: createAppBuilderPrompt(),
    prompt: JSON.stringify(blueprint, null, 2),
  })
}

export const generateApplicationTool = createTool({
  id: "generate_application",
  description: "基于已校验的 Product Blueprint 生成可在 Sandpack 中运行的 React 应用文件。",
  strict: true,
  inputSchema: z.object({
    blueprint: productBlueprintSchema,
  }),
  outputSchema: buildOutputSchema,
  execute: async (inputData) => generateApplication(productBlueprintSchema.parse(inputData.blueprint)),
})

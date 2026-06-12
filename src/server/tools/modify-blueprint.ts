import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { productBlueprintSchema } from "@/server/contracts"
import { createModifyBlueprintPrompt } from "@/server/generation/prompts/modify-blueprint-prompt"

export const modifyBlueprintInputSchema = z.object({
  blueprint: productBlueprintSchema,
  instruction: z.string().min(3).describe("用户修改指令，如'再加一个 Contact 实体'"),
})

/**
 * 基于用户自然语言指令增量修改已有的 Product Blueprint
 * 保留所有未提及的字段和结构
 */
export async function modifyBlueprint(input: z.infer<typeof modifyBlueprintInputSchema>) {
  return generateStructuredObject({
    schema: productBlueprintSchema,
    system: createModifyBlueprintPrompt(),
    prompt: `当前 Blueprint：\n${JSON.stringify(input.blueprint, null, 2)}\n\n用户修改指令：${input.instruction}`,
  })
}

export const modifyBlueprintTool = createTool({
  id: "modify_blueprint",
  description: "基于用户自然语言指令增量修改 Product Blueprint，保留未提及的部分。",
  strict: true,
  inputSchema: modifyBlueprintInputSchema,
  outputSchema: productBlueprintSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: async (inputData: any) => modifyBlueprint(inputData),
})

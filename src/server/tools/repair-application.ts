import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { buildOutputSchema, productBlueprintSchema, reviewResultSchema } from "@/server/contracts"
import { generationSafetyConstraints } from "@/server/generation/prompts/app-builder-prompt"
import { looseBuildOutputSchema, normalizeFilePath, prepareGeneratedBuild } from "./format-generated-build"

export const repairApplicationInputSchema = z.object({
  blueprint: productBlueprintSchema,
  build: buildOutputSchema,
  review: reviewResultSchema,
})

export async function repairApplication(input: z.infer<typeof repairApplicationInputSchema>) {
  const rawResult = await generateStructuredObject({
    schema: looseBuildOutputSchema,
    system: `你是 VentureFlow 的 Repair Agent。请只根据 Review issue 修复 Sandpack React 应用，保留已有有效功能，输出完整 BuildOutput。

${generationSafetyConstraints}`,
    prompt: JSON.stringify(input, null, 2),
  })

  // 标准化文件路径并严格校验
  const result = {
    summary: rawResult.summary,
    files: rawResult.files.map((file) => ({ ...file, path: normalizeFilePath(file.path) })),
  }

  return prepareGeneratedBuild(buildOutputSchema.parse(result))
}

export const repairApplicationTool = createTool({
  id: "repair_application",
  description: "基于 Review 结果修复生成应用，输出新的完整应用文件。",
  strict: true,
  inputSchema: repairApplicationInputSchema,
  outputSchema: buildOutputSchema,
  execute: async (inputData) => repairApplication(repairApplicationInputSchema.parse(inputData)),
})

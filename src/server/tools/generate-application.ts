import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import type { ProductBlueprint } from "@/server/contracts"
import { buildOutputSchema, productBlueprintSchema } from "@/server/contracts"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { createAppBuilderPrompt } from "@/server/generation/prompts/app-builder-prompt"
import { looseBuildOutputSchema, normalizeFilePath, prepareGeneratedBuild } from "./format-generated-build"

export async function generateApplication(blueprint: ProductBlueprint) {
  // 先用宽松 schema 接收 AI 输出（容错路径格式问题）
  const rawBuild = await generateStructuredObject({
    schema: looseBuildOutputSchema,
    system: createAppBuilderPrompt(),
    prompt: JSON.stringify(blueprint, null, 2),
  })

  // 标准化所有文件路径
  const build = {
    summary: rawBuild.summary,
    files: rawBuild.files.map((file) => ({
      ...file,
      path: normalizeFilePath(file.path),
    })),
  }

  // 用严格 schema 二次校验（确保 /App.tsx 必含、路径无重复等）
  const validated = buildOutputSchema.parse(build)
  return prepareGeneratedBuild(validated)
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

import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import type { ProductBlueprint } from "@/server/contracts"
import { buildOutputSchema, productBlueprintSchema } from "@/server/contracts"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { createAppBuilderPrompt } from "@/server/generation/prompts/app-builder-prompt"
import { prepareGeneratedBuild } from "./format-generated-build"

export async function generateApplication(blueprint: ProductBlueprint) {
  const build = await generateStructuredObject({
    schema: buildOutputSchema,
    system: createAppBuilderPrompt(),
    prompt: JSON.stringify(blueprint, null, 2),
  })

  const preparedBuild = await prepareGeneratedBuild(build)

  // 业务守卫：即使 Schema 层 superRefine 已校验，此处显式断言 /App.tsx 存在性
  // 确保后续修改 Schema 不会意外移除此关键约束
  if (!preparedBuild.files.some((file) => file.path === "/App.tsx")) {
    throw new Error("生成结果缺少 /App.tsx 入口文件")
  }

  return preparedBuild
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

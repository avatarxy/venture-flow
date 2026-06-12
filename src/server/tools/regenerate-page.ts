import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { buildOutputSchema, productBlueprintSchema } from "@/server/contracts"
import { generationSafetyConstraints } from "@/server/generation/prompts/app-builder-prompt"

export const regeneratePageInputSchema = z.object({
  blueprint: productBlueprintSchema,
  build: z.object({
    summary: z.string(),
    files: z.array(z.object({ path: z.string(), content: z.string() })),
  }),
  targetPage: z.string().min(1).describe("目标页面名称或路由"),
  instruction: z.string().min(3).describe("用户反馈，如'搜索功能改成实时筛选'"),
})

/**
 * 基于用户反馈重新生成应用中的指定页面，保留其他页面不变
 */
export async function regeneratePage(input: z.infer<typeof regeneratePageInputSchema>) {
  return generateStructuredObject({
    schema: buildOutputSchema,
    system: `你是 VentureFlow 的页面修复 Agent。
只修改用户指定的页面文件，所有其他文件保持完全不变。
${generationSafetyConstraints}`,
    prompt: JSON.stringify(
      {
        blueprint: input.blueprint,
        currentBuild: input.build.summary,
        targetPage: input.targetPage,
        instruction: input.instruction,
        allFiles: input.build.files.map((f) => ({ path: f.path })),
      },
      null,
      2,
    ),
  })
}

export const regeneratePageTool = createTool({
  id: "regenerate_page",
  description: "基于用户反馈重新生成应用中的指定页面，保留其他页面不变。",
  strict: true,
  inputSchema: regeneratePageInputSchema,
  outputSchema: buildOutputSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: async (inputData: any) => regeneratePage(inputData),
})

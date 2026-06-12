import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { buildOutputSchema, productBlueprintSchema } from "@/server/contracts"
import { generationSafetyConstraints } from "@/server/generation/prompts/app-builder-prompt"
import { prepareGeneratedBuild } from "./format-generated-build"

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
  const result = await generateStructuredObject({
    schema: buildOutputSchema,
    system: `你是 VentureFlow 的应用修改 Agent。
优先按用户指定的 targetPage 修改对应页面。若 targetPage 为“应用”或用户要求涉及导航、共享组件、跨页面功能、文案联动，可以修改必要的相关文件；未涉及文件保持不变。
输出完整 BuildOutput，必须包含修改后的全部文件内容。
${generationSafetyConstraints}`,
    prompt: JSON.stringify(
      {
        blueprint: input.blueprint,
        currentBuild: input.build.summary,
        targetPage: input.targetPage,
        instruction: input.instruction,
        allFiles: input.build.files,
      },
      null,
      2,
    ),
  })

  return prepareGeneratedBuild(result)
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

import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { capabilityLimits } from "./inspect-capabilities"

export const validateBlueprintCapabilityInputSchema = z.object({
  pagesCount: z.number().int().nonnegative(),
  entitiesCount: z.number().int().nonnegative(),
  coreFeaturesCount: z.number().int().nonnegative(),
})

export const validateBlueprintCapabilityOutputSchema = z.object({
  passed: z.boolean(),
  issues: z.array(z.string()),
})

export function validateBlueprintCapability(input: z.infer<typeof validateBlueprintCapabilityInputSchema>) {
  const issues: string[] = []

  if (input.pagesCount > capabilityLimits.maxPages) {
    issues.push(`页面数量超过 MVP 上限 ${capabilityLimits.maxPages} 个`)
  }

  if (input.entitiesCount > capabilityLimits.maxEntities) {
    issues.push(`实体数量超过 MVP 上限 ${capabilityLimits.maxEntities} 个`)
  }

  if (input.coreFeaturesCount > capabilityLimits.maxCoreFeatures) {
    issues.push(`核心功能数量超过 MVP 上限 ${capabilityLimits.maxCoreFeatures} 个`)
  }

  return {
    passed: issues.length === 0,
    issues,
  }
}

export const validateBlueprintTool = createTool({
  id: "validate_blueprint",
  description: "校验 Product Blueprint 是否落在 VentureFlow MVP 能力边界内。",
  strict: true,
  inputSchema: validateBlueprintCapabilityInputSchema,
  outputSchema: validateBlueprintCapabilityOutputSchema,
  execute: async (inputData) => validateBlueprintCapability(inputData),
})

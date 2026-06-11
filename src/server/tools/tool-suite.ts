import { createToolRegistry } from "@/server/agent/tool-registry"
import type { JsonValue } from "@/server/contracts/json"
import { productBlueprintSchema, strategyOutputSchema, buildOutputSchema, reviewResultSchema } from "@/server/contracts"
import { analyzeProblem, analyzeProblemTool } from "./analyze-problem"
import { createBlueprint, createBlueprintTool } from "./create-blueprint"
import { generateApplication, generateApplicationTool } from "./generate-application"
import { buildInspectionInputSchema, inspectBuild, inspectBuildTool } from "./inspect-build"
import { inspectCapabilities, inspectCapabilitiesTool } from "./inspect-capabilities"
import { optimizeProduct, optimizeProductInputSchema, optimizeProductTool } from "./optimize-product"
import { repairApplication, repairApplicationTool } from "./repair-application"
import { validateBlueprintCapability, validateBlueprintTool } from "./validate-blueprint"

export const mastraTools = {
  analyzeProblemTool,
  inspectCapabilitiesTool,
  createBlueprintTool,
  validateBlueprintTool,
  generateApplicationTool,
  inspectBuildTool,
  repairApplicationTool,
  optimizeProductTool,
}

/**
 * 从 args 或 state 中安全提取并校验 Blueprint
 * 替代之前的 `as never` 断言，通过 Zod 运行时校验确保类型安全
 */
function resolveBlueprint(args: Record<string, unknown>, state: { blueprint?: unknown }) {
  const raw = state.blueprint ?? args.blueprint
  if (!raw) {
    throw new Error("无法解析 Blueprint：state 和 args 中均未提供")
  }
  return productBlueprintSchema.parse(raw)
}

export function createVentureFlowToolSuite() {
  return createToolRegistry([
    {
      name: "analyze_problem",
      async execute(args) {
        const result = await analyzeProblem(String(args.problem ?? ""))
        return {
          summary: "Strategy generated",
          statePatch: { strategy: result },
        }
      },
    },
    {
      name: "inspect_capabilities",
      async execute() {
        const result = inspectCapabilities()
        return {
          summary: "VentureFlow capabilities inspected",
          statePatch: { capabilities: result },
        }
      },
    },
    {
      name: "create_blueprint",
      async execute(args, state) {
        const strategy = state.strategy ?? (args.strategy ? strategyOutputSchema.parse(args.strategy) : undefined)
        if (!strategy) {
          throw new Error("无法解析 Strategy：state 和 args 中均未提供")
        }
        const result = await createBlueprint({
          originalProblem: String(args.originalProblem ?? state.originalProblem),
          strategy,
        })
        return {
          summary: "Blueprint generated",
          statePatch: { blueprint: result },
        }
      },
    },
    {
      name: "validate_blueprint",
      async execute(args, state) {
        const blueprint = state.blueprint
        const result = validateBlueprintCapability({
          pagesCount: Number(args.pagesCount ?? blueprint?.pages.length ?? 0),
          entitiesCount: Number(args.entitiesCount ?? blueprint?.entities.length ?? 0),
          coreFeaturesCount: Number(args.coreFeaturesCount ?? blueprint?.workflows.length ?? 0),
        })
        return {
          summary: result.passed ? "Blueprint capability validation passed" : "Blueprint capability validation failed",
          statePatch: {},
        }
      },
    },
    {
      name: "generate_application",
      async execute(args, state) {
        const blueprint = resolveBlueprint(args, state)
        const result = await generateApplication(blueprint)
        return {
          summary: "Application generated",
          statePatch: { build: result },
        }
      },
    },
    {
      name: "inspect_build",
      async execute(args, state) {
        const rawBuild = args.build ?? state.build
        if (!rawBuild) {
          throw new Error("无法解析 Build：state 和 args 中均未提供")
        }
        // inspectBuild 内部会通过 buildInspectionInputSchema.parse() 校验
        const result = inspectBuild(rawBuild as Parameters<typeof inspectBuild>[0])
        return {
          summary: result.passed ? "Build inspection passed" : "Build inspection failed",
          statePatch: { review: result },
        }
      },
    },
    {
      name: "repair_application",
      async execute(args, state) {
        const blueprint = resolveBlueprint(args, state)
        const rawBuild = state.build ?? args.build
        const rawReview = state.review ?? args.review
        if (!rawBuild) {
          throw new Error("无法解析 Build：state 和 args 中均未提供")
        }
        if (!rawReview) {
          throw new Error("无法解析 Review：state 和 args 中均未提供")
        }
        const result = await repairApplication({
          blueprint,
          build: buildOutputSchema.parse(rawBuild),
          review: reviewResultSchema.parse(rawReview),
        })
        return {
          summary: "Application repaired",
          statePatch: { build: result },
        }
      },
    },
    {
      name: "optimize_product",
      async execute(args, state) {
        const blueprint = resolveBlueprint(args, state)
        // usageEvents 从 JsonValue[] 中安全转换为 Record<string, JsonValue>[]
        const rawUsageEvents = Array.isArray(args.usageEvents) ? args.usageEvents : []
        const usageEvents = rawUsageEvents.map((event) => {
          if (event && typeof event === "object" && !Array.isArray(event)) {
            return event as Record<string, JsonValue>
          }
          throw new Error("usageEvents 中每项必须是对象")
        })
        const result = await optimizeProduct(
          optimizeProductInputSchema.parse({ blueprint, usageEvents }),
        )
        return {
          summary: "Product optimization generated",
          statePatch: { optimization: result },
        }
      },
    },
  ])
}

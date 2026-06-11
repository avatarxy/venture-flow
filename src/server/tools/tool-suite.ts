import { createToolRegistry } from "@/server/agent/tool-registry"
import { analyzeProblem, analyzeProblemTool } from "./analyze-problem"
import { createBlueprint, createBlueprintTool } from "./create-blueprint"
import { generateApplication, generateApplicationTool } from "./generate-application"
import { inspectBuild, inspectBuildTool } from "./inspect-build"
import { inspectCapabilities, inspectCapabilitiesTool } from "./inspect-capabilities"
import { optimizeProduct, optimizeProductTool } from "./optimize-product"
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
        inspectCapabilities()
        return {
          summary: "VentureFlow capabilities inspected",
          statePatch: {},
        }
      },
    },
    {
      name: "create_blueprint",
      async execute(args, state) {
        const result = await createBlueprint({
          originalProblem: String(args.originalProblem ?? state.originalProblem),
          strategy: state.strategy ?? args.strategy,
        } as never)
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
        const result = await generateApplication((state.blueprint ?? args.blueprint) as never)
        return {
          summary: "Application generated",
          statePatch: { build: result },
        }
      },
    },
    {
      name: "inspect_build",
      async execute(args, state) {
        const result = inspectBuild((args.build ?? state.build) as never)
        return {
          summary: result.passed ? "Build inspection passed" : "Build inspection failed",
          statePatch: { review: result },
        }
      },
    },
    {
      name: "repair_application",
      async execute(args, state) {
        const result = await repairApplication({
          blueprint: state.blueprint ?? args.blueprint,
          build: state.build ?? args.build,
          review: state.review ?? args.review,
        } as never)
        return {
          summary: "Application repaired",
          statePatch: { build: result },
        }
      },
    },
    {
      name: "optimize_product",
      async execute(args, state) {
        await optimizeProduct({
          blueprint: (state.blueprint ?? args.blueprint) as never,
          usageEvents: (args.usageEvents ?? []) as never,
        })
        return {
          summary: "Product optimization generated",
          statePatch: {},
        }
      },
    },
  ])
}

import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const capabilityLimits = {
  maxPages: 8,
  maxEntities: 6,
  maxCoreFeatures: 12,
  allowedDependencies: [
    "react",
    "react-dom",
    "lucide-react",
    "recharts",
    "tailwindcss",
    "postcss",
    "autoprefixer",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "@radix-ui/react-slot",
  ],
  unsupported: ["实时多人协同编辑", "复杂支付结算", "任意后端运行环境", "任意 NPM 依赖", "原生移动应用"],
} as const

export const inspectCapabilitiesOutputSchema = z.object({
  appPatterns: z.array(z.string()),
  maxPages: z.number().int(),
  maxEntities: z.number().int(),
  maxCoreFeatures: z.number().int(),
  allowedDependencies: z.array(z.string()),
  unsupported: z.array(z.string()),
})

export function inspectCapabilities() {
  return {
    appPatterns: ["dashboard", "crm", "feedback-board", "task-manager", "content-planner", "booking-manager", "survey", "custom-crud"],
    maxPages: capabilityLimits.maxPages,
    maxEntities: capabilityLimits.maxEntities,
    maxCoreFeatures: capabilityLimits.maxCoreFeatures,
    allowedDependencies: [...capabilityLimits.allowedDependencies],
    unsupported: [...capabilityLimits.unsupported],
  }
}

export const inspectCapabilitiesTool = createTool({
  id: "inspect_capabilities",
  description: "读取 VentureFlow MVP 支持的应用类型、复杂度上限、依赖白名单和不支持能力。",
  strict: true,
  inputSchema: z.object({}),
  outputSchema: inspectCapabilitiesOutputSchema,
  execute: async () => inspectCapabilities(),
})

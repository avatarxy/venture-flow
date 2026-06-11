import type { AgentState } from "@/server/contracts"
import { buildOutputSchema, productBlueprintSchema, reviewResultSchema, strategyOutputSchema } from "@/server/contracts"

export function canFinish(state: Pick<AgentState, "strategy" | "blueprint" | "build" | "review">) {
  const strategy = strategyOutputSchema.safeParse(state.strategy)
  const blueprint = productBlueprintSchema.safeParse(state.blueprint)
  const build = buildOutputSchema.safeParse(state.build)
  const review = reviewResultSchema.safeParse(state.review)

  return Boolean(strategy.success && blueprint.success && build.success && review.success && review.data.passed)
}

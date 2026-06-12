import type { AgentState } from "@/server/contracts"
import { buildOutputSchema, productBlueprintSchema, reviewResultSchema, strategyOutputSchema } from "@/server/contracts"

/**
 * 管道自然完成条件：
 * strategy + blueprint + build + review 全部有效且 review.passed === true
 */
export function canFinish(state: Pick<AgentState, "strategy" | "blueprint" | "build" | "review">) {
  const strategy = strategyOutputSchema.safeParse(state.strategy)
  const blueprint = productBlueprintSchema.safeParse(state.blueprint)
  const build = buildOutputSchema.safeParse(state.build)
  const review = reviewResultSchema.safeParse(state.review)

  return Boolean(strategy.success && blueprint.success && build.success && review.success && review.data.passed)
}

/**
 * 对话式用户确认完成条件：
 * 用户主动确认完成，要求低于管道（只需有 build）
 */
export function canFinishByUserAccept(state: Pick<AgentState, "build">): boolean {
  const build = buildOutputSchema.safeParse(state.build)
  return build.success && build.data.files.length > 0
}

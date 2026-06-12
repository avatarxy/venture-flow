export const MAX_AGENT_STEPS = 12
export const MAX_BUILD_ATTEMPTS = 2
export const MAX_REPAIR_ATTEMPTS = 1

/**
 * 对话式：Agent 可以在这些步骤产出后暂停，等待用户反馈
 * 如果用户选择沉默，Agent 会继续自动执行
 */
export const STEPS_THAT_CAN_WAIT_FOR_USER = [
  "analyze_problem",
  "create_blueprint",
  "generate_application",
  "repair_application",
]

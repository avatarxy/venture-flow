import type { AgentState, ToolName } from "@/server/contracts"
import type { JsonValue } from "@/server/contracts/json"

export type AgentToolResult = {
  summary: string
  statePatch: Partial<AgentState>
}

export type AgentTool = {
  name: ToolName
  execute: (args: Record<string, JsonValue>, state: AgentState) => Promise<AgentToolResult>
}

// Mastra tools 负责 Schema、描述和执行；Runtime registry 只负责白名单查找和 AgentState patch 边界。
export function createToolRegistry(tools: AgentTool[]) {
  const registry = new Map(tools.map((tool) => [tool.name, tool]))

  return {
    get(toolName: ToolName) {
      const tool = registry.get(toolName)

      if (!tool) {
        throw new Error(`Tool is not registered: ${toolName}`)
      }

      return tool
    },
  }
}

export type AgentToolRegistry = ReturnType<typeof createToolRegistry>

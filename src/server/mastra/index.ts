import { Mastra } from "@mastra/core"
import { supervisorAgent } from "./agents/supervisor-agent"
import { mastraTools } from "@/server/tools/tool-suite"

export const mastra = new Mastra({
  tools: mastraTools,
  agents: {
    supervisorAgent,
  },
})

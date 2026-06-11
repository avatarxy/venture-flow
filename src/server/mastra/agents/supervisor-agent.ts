import { Agent } from "@mastra/core/agent"
import { supervisorInstructions } from "../instructions/supervisor-instructions"

export const supervisorAgent = new Agent({
  id: "ventureflow-supervisor",
  name: "VentureFlow Supervisor Agent",
  instructions: supervisorInstructions,
  model: "openai/gpt-4.1-mini",
})

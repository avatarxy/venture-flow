import { Agent } from "@mastra/core/agent"
import { getPrimaryModel } from "@/server/ai/model"
import { supervisorInstructions } from "../instructions/supervisor-instructions"

export const supervisorAgent = new Agent({
  id: "ventureflow-supervisor",
  name: "VentureFlow Supervisor Agent",
  instructions: supervisorInstructions,
  model: getPrimaryModel(),
})

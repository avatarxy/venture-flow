import { describe, expect, it } from "vitest"
import { createInitialAgentState } from "@/server/agent/state-factory"
import { createVentureFlowToolSuite } from "./tool-suite"

describe("createVentureFlowToolSuite", () => {
  it("exposes local inspect_build as runtime tool", async () => {
    const suite = createVentureFlowToolSuite()
    const result = await suite.get("inspect_build").execute(
      {
        build: {
          summary: "ok",
          files: [
            {
              path: "/App.tsx",
              content:
                "export default function App() { localStorage.setItem('vf-generated-demo', '1'); return <button onClick={() => localStorage.getItem('vf-generated-demo')}>新增</button> }",
            },
          ],
        },
      },
      createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"),
    )

    expect(result.summary).toBe("Build inspection passed")
    expect(result.statePatch.review?.passed).toBe(true)
  })

  it("exposes inspect_capabilities as runtime tool", async () => {
    const suite = createVentureFlowToolSuite()
    const result = await suite.get("inspect_capabilities").execute({}, createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"))

    expect(result.summary).toContain("capabilities")
    expect(result.statePatch.toolCalls).toBeUndefined()
  })
})

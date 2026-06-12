import { describe, expect, it, vi } from "vitest"
import { createInitialAgentState } from "@/server/agent/state-factory"
import { optimizationOutputSchema, productBlueprintSchema, strategyOutputSchema } from "@/server/contracts"
import { validBlueprint } from "@/server/agent/agent-fixtures"
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

  it("exposes inspect_capabilities as runtime tool and returns capability data", async () => {
    const suite = createVentureFlowToolSuite()
    const result = await suite.get("inspect_capabilities").execute({}, createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"))

    expect(result.summary).toContain("capabilities")
    expect(result.statePatch.capabilities).toBeDefined()
    expect(result.statePatch.capabilities?.maxPages).toBe(5)
    expect(result.statePatch.capabilities?.allowedDependencies).toContain("react")
  })

  it("exposes validate_blueprint as runtime tool", async () => {
    const suite = createVentureFlowToolSuite()
    const state = { ...createInitialAgentState("project_1", "test"), blueprint: validBlueprint }
    const result = await suite.get("validate_blueprint").execute({}, state)

    expect(result.summary).toContain("validation")
  })

  it("throws when generate_application is called without blueprint", async () => {
    const suite = createVentureFlowToolSuite()
    const state = createInitialAgentState("project_1", "test")

    await expect(suite.get("generate_application").execute({}, state)).rejects.toThrow("无法解析 Blueprint")
  })

  it("throws when inspect_build is called without build", async () => {
    const suite = createVentureFlowToolSuite()
    const state = createInitialAgentState("project_1", "test")

    await expect(suite.get("inspect_build").execute({}, state)).rejects.toThrow("无法解析 Build")
  })
})

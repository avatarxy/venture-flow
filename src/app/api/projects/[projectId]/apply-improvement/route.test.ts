import { describe, expect, it } from "vitest"
import { POST } from "./route"

const context = { params: Promise.resolve({ projectId: "project_1" }) }

function jsonRequest(body: unknown) {
  return new Request("http://test.local/api/projects/project_1/apply-improvement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("apply improvement route", () => {
  it("accepts a valid patch request", async () => {
    const response = await POST(
      jsonRequest({
        goal: "Increase lead creation",
        recommendation: "Make the add lead CTA easier to find",
        targetFiles: ["/App.tsx"],
        constraints: ["Keep generated app in Sandpack"],
      }),
      context,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      projectId: "project_1",
      status: "accepted",
      patchRequest: {
        goal: "Increase lead creation",
        recommendation: "Make the add lead CTA easier to find",
        targetFiles: ["/App.tsx"],
        constraints: ["Keep generated app in Sandpack"],
      },
    })
  })

  it("rejects invalid patch requests", async () => {
    const response = await POST(
      jsonRequest({
        goal: "",
        recommendation: "Make the add lead CTA easier to find",
        targetFiles: ["App.tsx"],
        constraints: [],
      }),
      context,
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Patch request is invalid" })
  })

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://test.local/api/projects/project_1/apply-improvement", {
        method: "POST",
        body: "{",
      }),
      context,
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "请求体必须是有效 JSON" })
  })
})

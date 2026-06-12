import { NextResponse } from "next/server"
import { createProject } from "@/server/projects/project-repository"

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "请求体必须是有效 JSON" }, { status: 400 })
  }

  const originalProblem =
    typeof body === "object" && body !== null && "originalProblem" in body
      ? String((body as { originalProblem?: unknown }).originalProblem ?? "").trim()
      : ""

  if (originalProblem.length < 20) {
    return NextResponse.json({ error: "业务问题至少需要 20 个字符" }, { status: 400 })
  }

  const project = await createProject(originalProblem)

  return NextResponse.json({ project })
}

import { NextResponse } from "next/server"
import { patchRequestSchema } from "@/server/tools/apply-improvement"

type ApplyImprovementRouteContext = {
  params: Promise<{ projectId: string }>
}

export async function POST(request: Request, { params }: ApplyImprovementRouteContext) {
  const { projectId } = await params
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "请求体必须是有效 JSON" }, { status: 400 })
  }

  const patchRequest = patchRequestSchema.safeParse(body)

  if (!patchRequest.success) {
    return NextResponse.json({ error: "Patch request is invalid" }, { status: 400 })
  }

  return NextResponse.json({
    projectId,
    patchRequest: patchRequest.data,
    status: "accepted",
  })
}

import { NextResponse } from "next/server"
import { z } from "zod"
import { recordUsageEvent } from "@/server/events/event-repository"

const usageEventRequestSchema = z.object({
  projectId: z.string().trim().min(1),
  versionId: z.string().trim().min(1),
  eventName: z.string().trim().min(1),
  entityName: z.string().trim().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

function isUsageEventValidationError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false
  }

  return (
    error.message.startsWith("Unsupported usage event") ||
    error.message.startsWith("Usage event metadata") ||
    error.message === "Usage event version does not belong to project"
  )
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "请求体必须是有效 JSON" }, { status: 400 })
  }

  const parsedBody = usageEventRequestSchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Usage event payload is invalid" }, { status: 400 })
  }

  try {
    const event = await recordUsageEvent(parsedBody.data)

    return NextResponse.json({ event })
  } catch (error) {
    if (isUsageEventValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to record usage event" }, { status: 500 })
  }
}

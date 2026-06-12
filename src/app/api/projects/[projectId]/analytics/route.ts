import { NextResponse } from "next/server"
import { aggregateUsageEvents } from "@/server/analytics/analytics-service"
import { prisma } from "@/server/db/client"

type AnalyticsRouteContext = {
  params: Promise<{ projectId: string }>
}

export async function GET(_: Request, { params }: AnalyticsRouteContext) {
  const { projectId } = await params
  const events = await prisma.usageEvent.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  return NextResponse.json({
    summary: aggregateUsageEvents(events),
    events,
  })
}

import { NextResponse } from "next/server"
import { productBlueprintSchema } from "@/server/contracts"
import { jsonValueSchema } from "@/server/contracts/json"
import { prisma } from "@/server/db/client"
import { optimizeProduct } from "@/server/tools/optimize-product"

type OptimizeRouteContext = {
  params: Promise<{ projectId: string }>
}

function serializeUsageEvent(event: {
  id: string
  eventName: string
  entityName: string | null
  metadata: unknown
  createdAt: Date
}) {
  const metadata = jsonValueSchema.safeParse(event.metadata)

  return {
    id: event.id,
    eventName: event.eventName,
    entityName: event.entityName,
    metadata: metadata.success ? metadata.data : null,
    createdAt: event.createdAt.toISOString(),
  }
}

export async function POST(_: Request, { params }: OptimizeRouteContext) {
  const { projectId } = await params
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, blueprint: true },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const blueprint = productBlueprintSchema.safeParse(project.blueprint)

  if (!blueprint.success) {
    return NextResponse.json({ error: "Project blueprint is invalid" }, { status: 400 })
  }

  const events = await prisma.usageEvent.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      eventName: true,
      entityName: true,
      metadata: true,
      createdAt: true,
    },
  })

  if (events.length === 0) {
    return NextResponse.json({
      findings: [],
      recommendations: [],
      message: "当前真实使用数据不足，无法生成可靠优化建议。",
    })
  }

  const optimization = await optimizeProduct({
    blueprint: blueprint.data,
    usageEvents: events.map(serializeUsageEvent),
  })

  return NextResponse.json(optimization)
}

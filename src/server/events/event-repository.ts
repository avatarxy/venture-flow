import type { Prisma } from "@prisma/client"
import { prisma } from "@/server/db/client"

const allowedEvents = new Set([
  "app_opened",
  "entity_created",
  "entity_updated",
  "entity_deleted",
  "filter_used",
  "search_used",
  "status_changed",
  "primary_action_clicked",
])

type PrimitiveMetadataValue = string | number | boolean | null

export function assertUsageEventAllowed(eventName: string) {
  if (!allowedEvents.has(eventName)) {
    throw new Error(`Unsupported usage event: ${eventName}`)
  }
}

export function normalizeUsageMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) {
    return undefined
  }

  const normalized: Record<string, PrimitiveMetadataValue> = {}

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) {
      continue
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
      normalized[key] = value
      continue
    }

    throw new Error("Usage event metadata only supports primitive values")
  }

  if (JSON.stringify(normalized).length > 2048) {
    throw new Error("Usage event metadata is too large")
  }

  return normalized
}

export async function recordUsageEvent(input: {
  projectId: string
  versionId: string
  eventName: string
  entityName?: string
  metadata?: Record<string, unknown>
}) {
  assertUsageEventAllowed(input.eventName)
  const metadata = normalizeUsageMetadata(input.metadata)
  const version = await prisma.generatedVersion.findFirst({
    where: {
      id: input.versionId,
      projectId: input.projectId,
    },
    select: {
      id: true,
    },
  })

  if (!version) {
    throw new Error("Usage event version does not belong to project")
  }

  return prisma.usageEvent.create({
    data: {
      projectId: input.projectId,
      versionId: input.versionId,
      eventName: input.eventName,
      entityName: input.entityName,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  })
}

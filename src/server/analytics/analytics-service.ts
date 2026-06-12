export type UsageEventLike = {
  eventName: string
}

export type AnalyticsSummary = {
  totalVisits: number
  activeActions: number
  createdRecords: number
  statusChanges: number
  searchAndFilterUses: number
  topAction: { eventName: string; count: number } | null
}

const passiveEvents = new Set(["app_opened"])

function countByEventName(events: UsageEventLike[]) {
  const counts = new Map<string, number>()

  for (const event of events) {
    counts.set(event.eventName, (counts.get(event.eventName) ?? 0) + 1)
  }

  return counts
}

function getTopAction(events: UsageEventLike[]) {
  const counts = countByEventName(events.filter((event) => !passiveEvents.has(event.eventName)))
  let topAction: { eventName: string; count: number } | null = null

  for (const [eventName, count] of counts) {
    if (!topAction || count > topAction.count) {
      topAction = { eventName, count }
    }
  }

  return topAction
}

export function aggregateUsageEvents(events: UsageEventLike[]): AnalyticsSummary {
  return {
    totalVisits: events.filter((event) => event.eventName === "app_opened").length,
    activeActions: events.filter((event) => !passiveEvents.has(event.eventName)).length,
    createdRecords: events.filter((event) => event.eventName === "entity_created").length,
    statusChanges: events.filter((event) => event.eventName === "status_changed").length,
    searchAndFilterUses: events.filter((event) => event.eventName === "search_used" || event.eventName === "filter_used").length,
    topAction: getTopAction(events),
  }
}

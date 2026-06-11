export type LogLevel = "info" | "warn" | "error"

export function logSystemEvent(level: LogLevel, eventName: string, metadata: Record<string, unknown> = {}) {
  const payload = {
    level,
    eventName,
    metadata,
    createdAt: new Date().toISOString(),
  }

  console[level](JSON.stringify(payload))
}

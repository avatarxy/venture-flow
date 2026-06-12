export type SystemLogLevel = "info" | "warn" | "error"

export type SystemLogInput = {
  level: SystemLogLevel
  eventName: string
  projectId?: string
  generationId?: string
  message: string
  metadata?: Record<string, unknown>
}

export function writeSystemLog(input: SystemLogInput) {
  const payload = {
    ...input,
    createdAt: new Date().toISOString(),
  }

  console[input.level](JSON.stringify(payload))
}

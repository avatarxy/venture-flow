import type { AnalyticsSummary } from "@/server/analytics/analytics-service"

type AnalyticsPanelProps = {
  summary: AnalyticsSummary
}

export function AnalyticsPanel({ summary }: AnalyticsPanelProps) {
  const metrics = [
    ["总访问量", summary.totalVisits],
    ["活跃操作数", summary.activeActions],
    ["新增记录数", summary.createdRecords],
    ["状态变更次数", summary.statusChanges],
    ["搜索和筛选次数", summary.searchAndFilterUses],
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map(([label, value]) => (
        <div key={label} className="border border-border p-4 [border-radius:8px]">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
      ))}
      <div className="col-span-2 border border-border p-4 [border-radius:8px]">
        <div className="text-xs text-muted-foreground">最常用核心动作</div>
        <div className="mt-2 text-sm font-semibold">
          {summary.topAction ? `${summary.topAction.eventName} · ${summary.topAction.count} 次` : "暂无操作数据"}
        </div>
      </div>
    </div>
  )
}

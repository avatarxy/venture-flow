"use client"

import { Code2, MonitorPlay } from "lucide-react"
import { MessageCard } from "./MessageCard"
import { MarkdownContent } from "../MarkdownContent"

type BuildResultCardProps = {
  content: string
  build?: unknown
}

function fileCount(build: unknown) {
  if (typeof build !== "object" || build === null || !("files" in build)) return 0
  const files = (build as { files?: unknown }).files
  return Array.isArray(files) ? files.length : 0
}

export function BuildResultCard({ content, build }: BuildResultCardProps) {
  return (
    <MessageCard title="生成结果" tone="success">
      <div className="space-y-3">
        <MarkdownContent content={content} />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 border border-border bg-[rgba(252,251,248,0.48)] p-2 [border-radius:6px]">
            <Code2 className="size-3.5 text-[var(--color-success)]" aria-hidden="true" />
            {fileCount(build)} 个文件
          </div>
          <div className="flex items-center gap-2 border border-border bg-[rgba(252,251,248,0.48)] p-2 [border-radius:6px]">
            <MonitorPlay className="size-3.5 text-[var(--color-success)]" aria-hidden="true" />
            预览已同步
          </div>
        </div>
      </div>
    </MessageCard>
  )
}

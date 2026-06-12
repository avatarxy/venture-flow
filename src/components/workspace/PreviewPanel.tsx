"use client"

import { ExternalLink, Link2 } from "lucide-react"
import { useState } from "react"
import type { GeneratedFile } from "@/server/contracts"
import { SandpackErrorBoundary } from "@/components/generated-preview/SandpackErrorBoundary"
import { SandpackRunner } from "@/components/generated-preview/SandpackRunner"

type PreviewPanelProps = {
  projectId: string
  files: GeneratedFile[]
}

export function PreviewPanel({ projectId, files }: PreviewPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  async function publishPreviewLink() {
    setIsPublishing(true)
    setPublishError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/preview-link`, {
        method: "POST",
      })
      const payload = (await response.json()) as { previewUrl?: string; error?: string }
      if (!response.ok || !payload.previewUrl) {
        throw new Error(payload.error ?? "生成预览链接失败")
      }
      setPreviewUrl(payload.previewUrl)
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "生成预览链接失败")
    } finally {
      setIsPublishing(false)
    }
  }

  if (!files.length) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-muted-foreground">
        Agent 生成 React 应用后，Sandpack 预览会在这里同步出现。
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-11 shrink-0 items-center justify-between border-b border-border bg-background px-3">
        <div className="min-w-0 text-xs text-muted-foreground">
          {publishError ?? (previewUrl ? "在线预览链接已生成" : "Sandpack 本地预览")}
        </div>
        <div className="flex items-center gap-2">
          {previewUrl ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 px-2.5 text-xs text-foreground hover:bg-muted [border-radius:6px]"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              打开链接
            </a>
          ) : null}
          <button
            type="button"
            onClick={publishPreviewLink}
            disabled={isPublishing}
            className="inline-flex h-8 items-center gap-1.5 bg-[var(--color-ink)] px-2.5 text-xs text-[var(--color-ink-light)] disabled:opacity-55 [border-radius:6px]"
          >
            <Link2 className="size-3.5" aria-hidden="true" />
            {isPublishing ? "生成中" : "生成在线链接"}
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <SandpackErrorBoundary fallbackMessage="生成的应用存在渲染问题">
          <SandpackRunner files={files} />
        </SandpackErrorBoundary>
      </div>
    </div>
  )
}

"use client"

import type { GeneratedFile } from "@/server/contracts"
import { SandpackErrorBoundary } from "@/components/generated-preview/SandpackErrorBoundary"
import { SandpackRunner } from "@/components/generated-preview/SandpackRunner"

type PreviewPanelProps = {
  files: GeneratedFile[]
}

export function PreviewPanel({ files }: PreviewPanelProps) {
  if (!files.length) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-muted-foreground">
        Agent 生成 React 应用后，Sandpack 预览会在这里同步出现。
      </div>
    )
  }

  return (
    <SandpackErrorBoundary fallbackMessage="生成的应用存在渲染问题">
      <SandpackRunner files={files} />
    </SandpackErrorBoundary>
  )
}

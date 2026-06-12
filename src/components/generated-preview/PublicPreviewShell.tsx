"use client"

import type { GeneratedFile } from "@/server/contracts"
import { SandpackErrorBoundary } from "./SandpackErrorBoundary"
import { SandpackRunner } from "./SandpackRunner"

type PublicPreviewShellProps = {
  files: GeneratedFile[]
}

export function PublicPreviewShell({ files }: PublicPreviewShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <SandpackErrorBoundary fallbackMessage="公开预览渲染失败">
        <SandpackRunner files={files} showCodeTab={false} />
      </SandpackErrorBoundary>
    </main>
  )
}

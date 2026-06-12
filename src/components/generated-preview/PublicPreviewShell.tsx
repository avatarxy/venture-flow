"use client"

import type { GeneratedFile } from "@/server/contracts"
import { SandpackErrorBoundary } from "./SandpackErrorBoundary"
import { SandpackRunner } from "./SandpackRunner"

type PublicPreviewShellProps = {
  files: GeneratedFile[]
}

export function PublicPreviewShell({ files }: PublicPreviewShellProps) {
  return (
    <main className="h-screen min-h-screen overflow-hidden bg-background [height:100dvh]">
      <div className="h-full min-h-0">
        <SandpackErrorBoundary fallbackMessage="公开预览渲染失败">
          <SandpackRunner files={files} showCodeTab={false} />
        </SandpackErrorBoundary>
      </div>
    </main>
  )
}

"use client"

import type { GeneratedFile } from "@/server/contracts"
import { SandpackRunner } from "./SandpackRunner"

type PublicPreviewShellProps = {
  files: GeneratedFile[]
}

export function PublicPreviewShell({ files }: PublicPreviewShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <SandpackRunner files={files} />
    </main>
  )
}

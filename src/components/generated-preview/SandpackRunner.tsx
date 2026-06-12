"use client"

import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react"
import type { GeneratedFile } from "@/server/contracts"
import { normalizeSandpackFiles } from "@/server/preview/normalize-files"

type SandpackRunnerProps = {
  files: GeneratedFile[]
}

export function SandpackRunner({ files }: SandpackRunnerProps) {
  const sandpackFiles = normalizeSandpackFiles(files)

  return (
    <SandpackProvider
      template="vite-react-ts"
      files={sandpackFiles}
      options={{
        autorun: true,
        recompileMode: "delayed",
        recompileDelay: 400,
        activeFile: "/App.tsx",
        visibleFiles: files.map((file) => file.path),
      }}
      theme="light"
    >
      <SandpackLayout className="!h-full !border-0 !bg-transparent">
        <div className="grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_260px]">
          <SandpackPreview
            showNavigator
            showOpenInCodeSandbox={false}
            className="!h-full !min-h-0 !border-0 !bg-white"
          />
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            showInlineErrors
            wrapContent
            className="!h-full !border-x-0 !border-b-0 !border-t !border-[var(--color-border)]"
          />
        </div>
      </SandpackLayout>
    </SandpackProvider>
  )
}

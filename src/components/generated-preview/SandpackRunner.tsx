"use client"

import { Code2, MonitorPlay } from "lucide-react"
import { useState } from "react"
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react"
import type { GeneratedFile } from "@/server/contracts"
import {
  getVisibleGeneratedFilePaths,
  normalizeSandpackFiles,
} from "@/server/preview/normalize-files"

type SandpackRunnerProps = {
  files: GeneratedFile[]
  showCodeTab?: boolean
}

type RunnerTab = "preview" | "code"

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 px-3 text-xs transition [border-radius:6px] ${
        active
          ? "bg-[var(--color-ink)] text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export function SandpackRunner({
  files,
  showCodeTab = true,
}: SandpackRunnerProps) {
  const [activeTab, setActiveTab] = useState<RunnerTab>("preview")
  const sandpackFiles = normalizeSandpackFiles(files)
  const visibleFiles = getVisibleGeneratedFilePaths(files)
  const sandboxKey = visibleFiles
    .map((path) => `${path}:${sandpackFiles[path]?.code.length ?? 0}:${sandpackFiles[path]?.code.charCodeAt(0) ?? 0}`)
    .join("|")

  return (
    <SandpackProvider
      key={sandboxKey}
      template="vite-react-ts"
      files={sandpackFiles}
      options={{
        autorun: true,
        recompileMode: "delayed",
        recompileDelay: 400,
        activeFile: "/App.tsx",
        visibleFiles,
      }}
      theme="light"
    >
      <SandpackLayout className="!h-full !border-0 !bg-transparent">
        <div className="flex h-full min-h-0 w-full flex-col bg-background">
          {showCodeTab ? (
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-[rgba(252,251,248,0.78)] px-3">
              <div className="inline-flex border border-[var(--color-border-interactive)] bg-background p-1 [border-radius:8px]">
                <TabButton
                  active={activeTab === "preview"}
                  icon={<MonitorPlay className="size-3.5" aria-hidden="true" />}
                  label="Preview"
                  onClick={() => setActiveTab("preview")}
                />
                <TabButton
                  active={activeTab === "code"}
                  icon={<Code2 className="size-3.5" aria-hidden="true" />}
                  label="Code"
                  onClick={() => setActiveTab("code")}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {visibleFiles.length} 个生成文件
              </p>
            </div>
          ) : null}

          <div
            className={activeTab === "preview" ? "min-h-0 flex-1" : "hidden"}
          >
            <SandpackPreview
              showNavigator
              showOpenInCodeSandbox={false}
              className="!h-full !min-h-0 !border-0 !bg-white"
            />
          </div>

          {showCodeTab ? (
            <div
              className={
                activeTab === "code"
                  ? "grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)]"
                  : "hidden"
              }
            >
              <aside className="min-h-0 border-r border-border bg-[rgba(252,251,248,0.72)]">
                <div className="border-b border-border px-3 py-2 text-xs font-semibold text-foreground">
                  项目文件
                </div>
                <SandpackFileExplorer className="!h-[calc(100%-33px)] !border-0 !bg-transparent" />
              </aside>
              <SandpackCodeEditor
                showTabs={false}
                showLineNumbers
                showInlineErrors
                wrapContent
                className="!h-full !border-0 !bg-white"
              />
            </div>
          ) : null}
        </div>
      </SandpackLayout>
    </SandpackProvider>
  )
}

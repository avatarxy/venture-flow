"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

type SandpackErrorBoundaryProps = {
  children: ReactNode
  fallbackMessage?: string
}

type SandpackErrorBoundaryState = {
  hasError: boolean
  errorMessage: string
}

export class SandpackErrorBoundary extends Component<SandpackErrorBoundaryProps, SandpackErrorBoundaryState> {
  constructor(props: SandpackErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: "" }
  }

  static getDerivedStateFromError(error: Error): SandpackErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || "未知的渲染异常" }
  }

  handleRetry() {
    this.setState({ hasError: false, errorMessage: "" })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const message = this.props.fallbackMessage ?? "Preview 渲染失败"

    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-sm space-y-4 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[rgba(194,59,59,0.1)]">
            <AlertTriangle className="size-5 text-[var(--color-error)]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{message}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{this.state.errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => this.handleRetry()}
            className="inline-flex h-8 items-center gap-1.5 border border-[var(--color-border-interactive)] px-2.5 text-xs text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] [border-radius:6px]"
          >
            <RefreshCcw className="size-3.5" aria-hidden="true" />
            重试
          </button>
        </div>
      </div>
    )
  }
}

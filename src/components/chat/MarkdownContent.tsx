"use client"

import type { ReactNode } from "react"

type MarkdownProps = {
  content: string
}

/**
 * 将 AI 生成的基本 Markdown 文本转换为结构化的 JSX。
 * 支持的语法：## 标题、**粗体**、• 列表项、空行分段
 */
function parseMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const lines = text.split("\n")
  let key = 0
  let listItems: string[] = []
  let inParagraph = false
  let paraLines: string[] = []

  const flushList = () => {
    if (listItems.length === 0) return
    nodes.push(
      <ul key={key++} className="mt-1 space-y-0.5">
        {listItems.map((item) => (
          <li key={key++} className="flex gap-1.5 text-sm leading-relaxed">
            <span className="text-[var(--color-gold)] shrink-0">•</span>
            <InlineFormatting text={item} />
          </li>
        ))}
      </ul>,
    )
    listItems = []
  }

  const flushParagraph = () => {
    if (paraLines.length === 0) return
    nodes.push(
      <p key={key++} className="text-sm leading-relaxed">
        <InlineFormatting text={paraLines.join(" ")} />
      </p>,
    )
    paraLines = []
    inParagraph = false
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    // Heading
    if (line.startsWith("## ")) {
      flushList()
      flushParagraph()
      nodes.push(
        <h3 key={key++} className="text-sm font-semibold text-foreground mt-3 first:mt-0">
          <InlineFormatting text={line.slice(3)} />
        </h3>,
      )
      continue
    }

    // List item
    if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
      flushParagraph()
      listItems.push(line.replace(/^[-•*]\s+/, ""))
      continue
    }

    // Empty line = paragraph boundary
    if (line === "") {
      flushList()
      flushParagraph()
      continue
    }

    // Regular text — accumulate as paragraph
    flushList()
    inParagraph = true
    paraLines.push(line)
  }

  flushList()
  flushParagraph()

  // If nothing parsed, render as plain text
  if (nodes.length === 0 && text.trim()) {
    return [<p key={0} className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>]
  }

  return nodes
}

function InlineFormatting({ text }: { text: string }) {
  // Parse **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export function MarkdownContent({ content }: MarkdownProps) {
  if (!content || !content.trim()) return null
  return <div className="space-y-1">{parseMarkdown(content)}</div>
}

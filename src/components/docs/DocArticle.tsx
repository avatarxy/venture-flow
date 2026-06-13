"use client"

import type { ReactNode } from "react"

type Props = {
  content: string
}

/**
 * 文档专用 Markdown 渲染器。
 * 支持：# ## ### 标题、**粗体**、`内联代码`、- 列表、1. 有序列表、
 * | 表格 |、```代码块```、> 引用、--- 分割线、空行分段。
 */
function parseDocMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const lines = text.split("\n")
  let key = 0
  let i = 0

  const consumeEmpty = () => {
    while (i < lines.length && lines[i].trim() === "") i++
  }

  const parseInline = (t: string): ReactNode[] => {
    // 粗体 **text**
    const boldParts = t.split(/(\*\*[^*]+\*\*)/g)
    const result: ReactNode[] = []
    for (const part of boldParts) {
      if (part.startsWith("**") && part.endsWith("**")) {
        result.push(<strong key={key++} className="font-semibold">{part.slice(2, -2)}</strong>)
      } else {
        // 内联代码 `code`
        const codeParts = part.split(/(`[^`]+`)/g)
        for (const cp of codeParts) {
          if (cp.startsWith("`") && cp.endsWith("`")) {
            result.push(
              <code key={key++} className="rounded bg-[var(--color-gold-subtle)] px-1 py-0.5 font-mono text-[0.85em] text-[var(--color-gold)]">
                {cp.slice(1, -1)}
              </code>,
            )
          } else {
            result.push(<span key={key++}>{cp}</span>)
          }
        }
      }
    }
    return result
  }

  while (i < lines.length) {
    const line = lines[i]

    // 空行
    if (line.trim() === "") {
      i++
      continue
    }

    // --- 分割线
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={key++} className="my-8 border-border" />)
      i++
      continue
    }

    // > 引用块
    if (line.startsWith("> ")) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <blockquote key={key++} className="my-4 border-l-2 border-[var(--color-gold)] pl-4 italic text-muted-foreground">
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="text-sm leading-relaxed">{parseInline(ql)}</p>
          ))}
        </blockquote>,
      )
      continue
    }

    // ``` 代码块
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      nodes.push(
        <pre key={key++} className="my-4 overflow-x-auto rounded-lg border border-border bg-[rgba(28,28,28,0.03)] p-4 font-mono text-[13px] leading-relaxed">
          <code>{codeLines.join("\n")}</code>
        </pre>,
      )
      continue
    }

    // # Heading 1
    if (line.startsWith("# ")) {
      const id = line.slice(2).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/(^-|-$)/g, "")
      nodes.push(
        <h2 key={key++} id={id} className="mt-10 mb-4 text-2xl font-semibold leading-snug tracking-[-0.3px] first:mt-0">
          {parseInline(line.slice(2))}
        </h2>,
      )
      i++
      continue
    }

    // ## Heading 2
    if (line.startsWith("## ")) {
      const id = line.slice(3).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/(^-|-$)/g, "")
      nodes.push(
        <h3 key={key++} id={id} className="mt-8 mb-3 text-xl font-semibold leading-snug">
          {parseInline(line.slice(3))}
        </h3>,
      )
      i++
      continue
    }

    // ### Heading 3
    if (line.startsWith("### ")) {
      const id = line.slice(4).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/(^-|-$)/g, "")
      nodes.push(
        <h4 key={key++} id={id} className="mt-6 mb-2 text-base font-semibold leading-snug">
          {parseInline(line.slice(4))}
        </h4>,
      )
      i++
      continue
    }

    // | 表格 |
    if (line.trim().startsWith("|")) {
      const tableRows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].split("|").map((c) => c.trim()).filter(Boolean)
        tableRows.push(cells)
        i++
      }
      // 过滤掉分隔行 (如 |---|---|)
      const dataRows = tableRows.filter((row) => !row.every((c) => /^[-:]+$/.test(c)))
      if (dataRows.length > 0) {
        const header = dataRows[0]
        const body = dataRows.slice(1)
        nodes.push(
          <div key={key++} className="my-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-[rgba(28,28,28,0.02)]">
                  {header.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 font-semibold">{parseInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="border-b border-border last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-muted-foreground">{parseInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )
      }
      continue
    }

    // 有序列表 1. 
    if (/^\d+\.\s/.test(line.trim())) {
      const listLines: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listLines.push(lines[i].trim().replace(/^\d+\.\s+/, ""))
        i++
      }
      nodes.push(
        <ol key={key++} className="my-3 ml-5 list-decimal space-y-1">
          {listLines.map((item, li) => (
            <li key={li} className="pl-1 text-sm leading-relaxed text-muted-foreground">
              <span className="text-foreground">{parseInline(item)}</span>
            </li>
          ))}
        </ol>,
      )
      continue
    }

    // 无序列表 - 
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const listLines: string[] = []
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
        const t = lines[i].trim()
        listLines.push(t.startsWith("- ") ? t.slice(2) : t.slice(2))
        i++
      }
      nodes.push(
        <ul key={key++} className="my-3 ml-5 list-disc space-y-1">
          {listLines.map((item, li) => (
            <li key={li} className="pl-1 text-sm leading-relaxed text-muted-foreground">
              <span className="text-foreground">{parseInline(item)}</span>
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // 普通段落 — 收集连续行直到空行
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith("```") && !lines[i].trim().startsWith("|") && !lines[i].trim().startsWith(">") && !/^\d+\.\s/.test(lines[i].trim()) && !lines[i].trim().startsWith("- ") && !lines[i].trim().startsWith("* ") && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i].trim())
      i++
    }
    if (paraLines.length > 0) {
      nodes.push(
        <p key={key++} className="my-3 text-sm leading-relaxed text-muted-foreground">
          {parseInline(paraLines.join(" "))}
        </p>,
      )
    }
  }

  return nodes
}

export function DocArticle({ content }: Props) {
  if (!content?.trim()) return null
  return <div className="doc-content">{parseDocMarkdown(content)}</div>
}

"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import { MessageCard } from "./MessageCard"
import { MarkdownContent } from "../MarkdownContent"

type ReviewResultCardProps = {
  content: string
  review?: unknown
}

function isPassed(review: unknown) {
  return typeof review === "object" && review !== null && "passed" in review && (review as { passed?: unknown }).passed === true
}

function issueMessages(review: unknown) {
  if (typeof review !== "object" || review === null || !("issues" in review)) return []
  const issues = (review as { issues?: unknown }).issues
  if (!Array.isArray(issues)) return []
  return issues
    .map((issue) => (typeof issue === "object" && issue !== null && "message" in issue ? (issue as { message?: unknown }).message : null))
    .filter((message): message is string => typeof message === "string")
}

export function createReviewIssueItems(review: unknown) {
  return issueMessages(review).map((message, index) => ({
    key: `${index}-${message}`,
    message,
  }))
}

export function ReviewResultCard({ content, review }: ReviewResultCardProps) {
  const passed = isPassed(review)
  const issues = createReviewIssueItems(review)

  return (
    <MessageCard title="代码审查" tone={passed ? "success" : "error"}>
      <div className="space-y-3">
        <div className="flex gap-2">
          {passed ? <CheckCircle2 className="mt-1 size-4 shrink-0 text-[var(--color-success)]" aria-hidden="true" /> : <XCircle className="mt-1 size-4 shrink-0 text-[var(--color-error)]" aria-hidden="true" />}
          <MarkdownContent content={content} />
        </div>
        {issues.length > 0 ? (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {issues.slice(0, 4).map((issue) => (
              <li key={issue.key}>{issue.message}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </MessageCard>
  )
}

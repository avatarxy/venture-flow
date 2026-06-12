import type { BuildOutput } from "@/server/contracts"

// Regex patterns for sanitization
const disallowedControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/
const disallowedControlCharactersGlobal = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

const nulCharGlobal = /\u0000/g
const zeroWidthCharsGlobal = /[\u200B-\u200D\u2060]/g
const mdCodeBlockPattern = /```(?:tsx|typescript|jsx|javascript|js|ts|react)?\s*([\s\S]*?)```/i

export function hasDisallowedControlCharacters(content: string) {
  return disallowedControlCharacters.test(content)
}

/**
 * 检查代码中是否包含 NUL (\u0000) 空字符。
 * Sandpack 编译时遇到 NUL 会报 "Unknown character: 0"。
 */
export function hasNulCharacters(content: string) {
  return content.includes("\u0000")
}

/**
 * 提取 AI 回复中被 Markdown 代码块包裹的代码。
 * 例如:
 *   ```tsx\nconst App = ...\n```
 * 返回 const App = ...
 */
export function extractCodeBlock(content: string): string {
  const match = content.match(mdCodeBlockPattern)
  return match?.[1]?.trim() ?? content.trim()
}

/**
 * 综合清洗 AI 生成的代码内容。
 *
 * 处理以下问题：
 * 1. NUL 字符 (\u0000) — 最常导致 Sandpack "Unknown character: 0"
 * 2. UTF-8 BOM (\uFEFF) — 文件头不可见标记
 * 3. 零宽字符 (\u200B-\u200D, \u2060) — 不可见但影响解析
 * 4. 控制字符 (\u0001-\u001F 除 \n \r \t)
 * 5. Markdown 代码块包装 — 提取纯代码
 * 6. Windows 风格换行 \r\n → \n
 */
export function sanitizeGeneratedFileContent(content: string) {
  let code = content

  // 1. 提取 Markdown 代码块（处理 AI 回复包裹）
  code = extractCodeBlock(code)

  // 2. 逐层清洗不可见/有害字符
  code = code
    .replace(nulCharGlobal, "") // NUL: \u0000 — 最关键
    .replace(/^\uFEFF/, "") // UTF-8 BOM
    .replace(zeroWidthCharsGlobal, "") // 零宽字符
    .replace(disallowedControlCharactersGlobal, "") // 其他控制字符
    .replace(/\r\n?/g, "\n") // 统一换行为 \n
    .trim()

  return code
}

/**
 * 检查代码是否有潜在问题（用于日志/告警）。
 */
export function inspectGeneratedCode(content: string) {
  const issues: string[] = []

  if (hasNulCharacters(content)) issues.push(`NUL (\\u0000) chars: ${(content.match(nulCharGlobal) ?? []).length}`)
  if (content.charCodeAt(0) === 0xFEFF) issues.push("UTF-8 BOM at start")
  const zwCount = (content.match(zeroWidthCharsGlobal) ?? []).length
  if (zwCount > 0) issues.push(`Zero-width chars: ${zwCount}`)
  const lines = content.split("\n").length
  if (lines === 1 && content.length > 500) issues.push(`Single-line file (${content.length} chars)`)
  if (/^```/.test(content.trim())) issues.push("Markdown code block wrapper")

  return issues
}

export function sanitizeGeneratedBuild(build: BuildOutput): BuildOutput {
  return {
    ...build,
    files: build.files.map((file) => ({
      ...file,
      content: sanitizeGeneratedFileContent(file.content),
    })),
  }
}

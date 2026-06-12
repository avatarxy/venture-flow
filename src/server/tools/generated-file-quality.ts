import type { BuildOutput } from "@/server/contracts"

// Regex patterns for sanitization
// C0 control chars (except TAB \t=0x09, LF \n=0x0A, CR \r=0x0D)
const disallowedControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/
// C0 + DEL + C1 control chars (\u0080-\u009F) + BOM anywhere
const disallowedControlCharactersGlobal = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g

const nulCharGlobal = /\u0000/g
const c1ControlCharsGlobal = /[\u0080-\u009F]/g
const bomAnywhereGlobal = /\uFEFF/g
const zeroWidthCharsGlobal = /[\u200B-\u200D\u2060]/g
// Unicode line/paragraph separators — valid in JS but trip some parsers
const unicodeSeparatorsGlobal = /\u2028|\u2029/g
// Byte Order Mark alternatives: U+FFFE (reversed BOM), U+FEFF (BOM proper)
const byteOrderMarkGlobal = /\uFEFF|\uFFFE/g
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
 * 2. UTF-8 BOM (\uFEFF) / reversed BOM (\uFFFE) — 文件头不可见标记
 * 3. C0 控制字符 (\u0000-\u001F) — 除 \n \r \t 外全部移除
 * 4. C1 控制字符 (\u0080-\u009F) — 在某些解析器中会导致问题
 * 5. DEL 字符 (\u007F)
 * 6. 零宽字符 (\u200B-\u200D, \u2060) — 不可见但影响解析
 * 7. Unicode 行/段分隔符 (\u2028, \u2029) — 某些 parser 无法识别
 * 8. Markdown 代码块包装 — 提取纯代码
 * 9. Windows 风格换行 \r\n → \n
 */
export function sanitizeGeneratedFileContent(content: string) {
  let code = content

  // 1. 提取 Markdown 代码块（处理 AI 回复包裹）
  code = extractCodeBlock(code)

  // 2. 逐层清洗不可见/有害字符（顺序重要：先精确匹配再范围匹配）
  code = code
    .replace(nulCharGlobal, "") // NUL: \u0000 — 最关键
    .replace(byteOrderMarkGlobal, "") // BOM (\uFEFF, \uFFFE) — 任意位置
    .replace(zeroWidthCharsGlobal, "") // 零宽字符
    .replace(unicodeSeparatorsGlobal, "\n") // Unicode 行分隔符 → \n
    .replace(c1ControlCharsGlobal, "") // C1 控制字符 (\u0080-\u009F)
    .replace(disallowedControlCharactersGlobal, "") // C0 控制字符 + DEL
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
  if (byteOrderMarkGlobal.test(content)) issues.push("BOM (\\uFEFF/\\uFFFE) present")
  const zwCount = (content.match(zeroWidthCharsGlobal) ?? []).length
  if (zwCount > 0) issues.push(`Zero-width chars: ${zwCount}`)
  const c1Count = (content.match(c1ControlCharsGlobal) ?? []).length
  if (c1Count > 0) issues.push(`C1 control chars: ${c1Count}`)
  if (unicodeSeparatorsGlobal.test(content)) issues.push("Unicode line/paragraph separators found")
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

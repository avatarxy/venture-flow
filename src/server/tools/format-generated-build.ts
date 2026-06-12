import { z } from "zod"
import * as prettier from "prettier"
import type { BuildOutput } from "@/server/contracts"
import { sanitizeGeneratedFileContent } from "./generated-file-quality"

/**
 * 宽松版文件 Schema：路径格式放宽（AI 偶尔忘加 / 前缀或带 ./）。
 * 配合 normalizeFilePath 使用：先生成 → 标准化路径 → 严格校验。
 */
export const looseFileSchema = z.object({
  path: z.string().min(1),
  content: z.string().min(1),
})

export const looseBuildOutputSchema = z.object({
  summary: z.string().min(1),
  files: z.array(looseFileSchema).min(1),
})

/**
 * 标准化文件路径：确保以 / 开头，去除 ./ 或 ../ 前缀。
 *
 * 示例：
 * - "App.tsx"       → "/App.tsx"
 * - "./src/main.tsx" → "/src/main.tsx"
 * - "src/App.tsx"    → "/src/App.tsx"
 * - "/App.tsx"       → "/App.tsx" (不变)
 */
export function normalizeFilePath(raw: string): string {
  let path = raw.trim()

  if (path.startsWith("./")) path = path.slice(2)
  while (path.startsWith("../")) path = path.slice(3)

  if (!path.startsWith("/")) path = `/${path}`

  return path
}

const formattableExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".ts",
  ".tsx",
])

function getFileExtension(path: string) {
  const match = path.match(/\.[a-z0-9]+$/i)
  return match?.[0]?.toLowerCase() ?? ""
}

/**
 * 当 Prettier 因语法错误而失败时，使用基于文本的语句分割作为后备方案。
 * 主要处理 LLM 生成的单行文件（所有语句用 ; 连接，缺少换行）。
 */
function fallbackNormalize(content: string): string {
  const lines = content.split("\n")
  // 如果已经是多行格式，不需要处理
  if (lines.length > 3) return content

  // 单行/少行模式：在语句边界插入换行
  let result = ""
  for (let i = 0; i < content.length; i++) {
    result += content[i]

    // ; 或 } 后紧跟 import / const / interface / function / export / let / var / return / if / type / class / case
    if (content[i] !== ";" && content[i] !== "}") continue
    if (i + 1 >= content.length) continue

    let next = i + 1
    while (next < content.length && (content[next] === " " || content[next] === "\t")) next++

    const rest = content.slice(next)
    const looksLikeStatement =
      /^(import\b|const\b|interface\b|function\b|export\b|let\b|var\b|return\b|if\b|type\b|class\b|case\b|default\b|enum\b|\/\/)/.test(rest) ||
      rest.startsWith("const ") ||
      rest.startsWith("function ")

    if (looksLikeStatement) {
      result += "\n"
    }
  }

  return result
}

async function formatGeneratedFile(path: string, content: string) {
  const sanitized = sanitizeGeneratedFileContent(content)

  if (!formattableExtensions.has(getFileExtension(path))) {
    return sanitized
  }

  // 先尝试 Prettier 格式化
  try {
    return await prettier.format(sanitized, {
      filepath: path,
      printWidth: 100,
    })
  } catch {
    // Prettier 失败（通常是语法错误）→ 降级为文本分割
    try {
      return fallbackNormalize(sanitized)
    } catch {
      return sanitized
    }
  }
}

export async function prepareGeneratedBuild(build: BuildOutput): Promise<BuildOutput> {
  return {
    ...build,
    files: await Promise.all(
      build.files.map(async (file) => ({
        ...file,
        content: await formatGeneratedFile(file.path, file.content),
      })),
    ),
  }
}

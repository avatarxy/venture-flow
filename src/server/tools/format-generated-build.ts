import * as prettier from "prettier"
import type { BuildOutput } from "@/server/contracts"
import { sanitizeGeneratedFileContent } from "./generated-file-quality"

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

async function formatGeneratedFile(path: string, content: string) {
  const sanitized = sanitizeGeneratedFileContent(content)
  if (!formattableExtensions.has(getFileExtension(path))) {
    return sanitized
  }

  try {
    return await prettier.format(sanitized, {
      filepath: path,
      printWidth: 100,
    })
  } catch {
    // 生成内容可能暂时不是完整语法，不能因为格式化失败阻断修复链路。
    return sanitized
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

import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import type { BuildOutput, ReviewResult } from "@/server/contracts"
import { generatedFileSchema, reviewResultSchema } from "@/server/contracts"

export const buildInspectionInputSchema = z.object({
  summary: z.string().min(1),
  files: z.array(generatedFileSchema).min(1),
})

const forbiddenImports = ["axios", "fs", "path", "child_process", "http", "https"]
const forbiddenRuntimeApis = [
  { pattern: "fetch(", label: "外部网络请求 fetch" },
  { pattern: "XMLHttpRequest", label: "外部网络请求 XMLHttpRequest" },
  { pattern: "document.", label: "访问宿主页面 DOM" },
  { pattern: "window.parent", label: "访问宿主页面窗口" },
  { pattern: "dangerouslySetInnerHTML", label: "任意脚本注入风险" },
  { pattern: "innerHTML", label: "任意脚本注入风险" },
]

function importsForbiddenDependency(content: string, dependency: string) {
  return (
    content.includes(`from "${dependency}"`) ||
    content.includes(`from '${dependency}'`) ||
    content.includes(`require("${dependency}")`) ||
    content.includes(`require('${dependency}')`)
  )
}

export function inspectBuild(build: z.infer<typeof buildInspectionInputSchema> | BuildOutput): ReviewResult {
  const parsedBuild = buildInspectionInputSchema.parse(build)
  const issues: ReviewResult["issues"] = []
  const appFile = parsedBuild.files.find((file) => file.path === "/App.tsx")

  for (const file of parsedBuild.files) {
    for (const dependency of forbiddenImports) {
      if (importsForbiddenDependency(file.content, dependency)) {
        issues.push({ type: "forbidden_dependency", message: `禁止使用依赖 ${dependency}`, severity: "high" })
      }
    }

    for (const api of forbiddenRuntimeApis) {
      if (file.content.includes(api.pattern)) {
        issues.push({ type: "forbidden_dependency", message: `禁止使用 ${api.label}`, severity: "high" })
      }
    }
  }

  if (!appFile) {
    issues.push({ type: "missing_file", message: "缺少 /App.tsx 入口文件", severity: "high" })
  } else {
    if (!appFile.content.includes("export default")) {
      issues.push({ type: "missing_feature", message: "/App.tsx 必须包含默认导出", severity: "high" })
    }

    if (!appFile.content.includes("localStorage")) {
      issues.push({ type: "persistence_missing", message: "生成应用必须使用 localStorage 持久化业务数据", severity: "high" })
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    recommendedFix: issues.length ? "移除禁止依赖、补齐入口文件和必要持久化能力" : undefined,
  }
}

export const inspectBuildTool = createTool({
  id: "inspect_build",
  description: "静态检查生成应用是否包含入口文件、是否使用禁用依赖，以及是否满足基础运行边界。",
  strict: true,
  inputSchema: z.object({ build: buildInspectionInputSchema }),
  outputSchema: reviewResultSchema,
  execute: async (inputData) => inspectBuild(inputData.build),
})

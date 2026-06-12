import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import type { BuildOutput, ReviewResult } from "@/server/contracts"
import { generatedFileSchema, reviewResultSchema } from "@/server/contracts"
import { capabilityLimits } from "./inspect-capabilities"
import { hasDisallowedControlCharacters } from "./generated-file-quality"

export const buildInspectionInputSchema = z.object({
  summary: z.string().min(1),
  files: z.array(generatedFileSchema).min(1),
})

// 基于 allowedDependencies 白名单动态生成禁止 import 列表
// 允许的依赖（react, react-dom, lucide-react, recharts）之外的 import 一律视为禁止
const allowedImportPrefixes = [...capabilityLimits.allowedDependencies, "react/", "lucide-react/", "recharts/"]

// Node.js 内置模块，即使白名单机制也必须显式禁止
const nodeBuiltinModules = ["fs", "path", "child_process", "http", "https", "os", "net", "crypto", "stream", "buffer", "url"]

// 运行时 API 限制：使用正则减少误报
const forbiddenRuntimeApis = [
  { pattern: /\bfetch\s*\(/, label: "外部网络请求 fetch" },
  { pattern: /\bXMLHttpRequest\b/, label: "外部网络请求 XMLHttpRequest" },
  { pattern: /\bwindow\.parent\b/, label: "访问宿主页面窗口" },
  { pattern: /\bdangerouslySetInnerHTML\b/, label: "任意脚本注入风险 dangerouslySetInnerHTML" },
  { pattern: /\binnerHTML\s*=/, label: "任意脚本注入风险 innerHTML" },
  // document 访问限制：允许 Sandpack 内部 React 渲染所需的 document.title 等，
  // 但禁止直接操作 DOM 节点（getElementById、querySelector、createElement、body 等）
  { pattern: /\bdocument\.(getElementById|querySelector|querySelectorAll|createElement|body|head|forms|cookie)\b/, label: "访问宿主页面 DOM" },
]

// localStorage key 前缀要求
const localStorageKeyPrefix = "vf-generated-"

/**
 * 检测文件内容中是否存在非白名单的 import/require 语句
 * 解析 import 语句的模块名，判断是否在白名单内
 */
function findForbiddenImports(content: string): string[] {
  const violations: string[] = []

  // 匹配 import ... from 'module' 或 import ... from "module"
  const importFromRegex = /\bimport\s+[^;]*\s+from\s+['"]([^'"]+)['"]/g
  // 匹配 require('module') 或 require("module")
  const requireRegex = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g

  const allModules = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = importFromRegex.exec(content)) !== null) {
    allModules.add(match[1])
  }
  while ((match = requireRegex.exec(content)) !== null) {
    allModules.add(match[1])
  }

  for (const moduleName of allModules) {
    // 取模块的顶层名称（处理 @scope/package 和相对路径）
    const topLevelName = moduleName.startsWith("@") ? moduleName.split("/").slice(0, 2).join("/") : moduleName.split("/")[0]

    // Node.js 内置模块直接禁止
    if (nodeBuiltinModules.includes(topLevelName)) {
      violations.push(topLevelName)
      continue
    }

    // 相对路径 import 不检查（应用内部文件引用）
    if (topLevelName.startsWith(".") || topLevelName.startsWith("/")) {
      continue
    }

    // 检查是否在白名单内
    const isAllowed = allowedImportPrefixes.some(
      (allowed) => topLevelName === allowed || moduleName === allowed || moduleName.startsWith(allowed + "/"),
    )

    if (!isAllowed) {
      violations.push(topLevelName)
    }
  }

  return violations
}

/**
 * 检测 localStorage key 是否使用正确前缀
 * 匹配 localStorage.setItem('key', ...) 和 localStorage.getItem('key') 等
 */
function findInvalidLocalStorageKeys(content: string): string[] {
  const violations: string[] = []
  // 匹配 localStorage.setItem('xxx', ...) / localStorage.getItem('xxx') / localStorage.removeItem('xxx')
  const lsMethodRegex = /\blocalStorage\.(setItem|getItem|removeItem|setItem)\s*\(\s*['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null

  while ((match = lsMethodRegex.exec(content)) !== null) {
    const key = match[2]
    if (!key.startsWith(localStorageKeyPrefix)) {
      violations.push(key)
    }
  }

  return violations
}

/**
 * 移除代码中的注释，减少误报
 * 先移除字符串字面量内容（避免 URL 中的 // 被误判为注释），
 * 再移除单行和多行注释，最后还原字符串占位符
 */
function stripComments(code: string): string {
  // 先将字符串内容替换为占位符，避免 URL 中的 // 被误判为注释
  const strings: string[] = []
  let placeholderIndex = 0
  let processed = code.replace(/(['"`])(?:(?!\1|\\).|\\.)*\1/g, (match) => {
    strings.push(match)
    return `__STRING_PLACEHOLDER_${placeholderIndex++}__`
  })

  // 移除单行注释
  processed = processed.replace(/\/\/.*$/gm, "")
  // 移除多行注释
  processed = processed.replace(/\/\*[\s\S]*?\*\//g, "")

  // 还原字符串内容
  for (let i = 0; i < strings.length; i++) {
    processed = processed.replace(`__STRING_PLACEHOLDER_${i}__`, strings[i])
  }

  return processed
}

export function inspectBuild(build: z.infer<typeof buildInspectionInputSchema> | BuildOutput): ReviewResult {
  const parsedBuild = buildInspectionInputSchema.parse(build)
  const issues: ReviewResult["issues"] = []
  const appFile = parsedBuild.files.find((file) => file.path === "/App.tsx")

  for (const file of parsedBuild.files) {
    if (hasDisallowedControlCharacters(file.content)) {
      issues.push({ type: "missing_feature", message: `${file.path} 包含 Sandpack 无法解析的不可见控制字符`, severity: "high" })
    }

    // 基于白名单的 import 校验
    const forbiddenModules = findForbiddenImports(file.content)
    for (const moduleName of forbiddenModules) {
      issues.push({ type: "forbidden_dependency", message: `禁止使用依赖 ${moduleName}`, severity: "high" })
    }

    // 运行时 API 限制校验（排除注释中的误报）
    const strippedContent = stripComments(file.content)
    for (const api of forbiddenRuntimeApis) {
      if (api.pattern.test(strippedContent)) {
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
    } else {
      // 校验 localStorage key 前缀
      const invalidKeys = findInvalidLocalStorageKeys(appFile.content)
      for (const key of invalidKeys) {
        issues.push({ type: "persistence_missing", message: `localStorage key "${key}" 必须以 ${localStorageKeyPrefix} 开头`, severity: "medium" })
      }
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    recommendedFix: issues.length ? "移除禁止依赖、补齐入口文件、确保 localStorage key 以 vf-generated- 开头" : undefined,
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

import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { generateStructuredObject } from "@/server/ai/generate-structured"
import { productBlueprintSchema, strategyOutputSchema } from "@/server/contracts"
import type { ProductBlueprint } from "@/server/contracts"
import type { JsonValue } from "@/server/contracts/json"

export const createBlueprintInputSchema = z.object({
  originalProblem: z.string().min(20),
  strategy: strategyOutputSchema,
})

const looseFieldSchema = z.object({
  name: z.string(),
  label: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "date", "status", "select", "text"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
})

const looseBlueprintSchema = z.object({
  productName: z.string().min(2),
  description: z.string().min(20),
  problemSummary: z.string().min(10),
  targetUsers: z.array(z.string().min(1)).min(1),
  goals: z.array(z.string().min(1)).min(1),
  successMetrics: z.array(z.string().min(1)).min(1),
  appPattern: z.enum(["dashboard", "crm", "feedback-board", "task-manager", "content-planner", "booking-manager", "survey", "custom-crud"]),
  entities: z.array(z.object({
    name: z.string(),
    label: z.string().min(1),
    description: z.string().optional(),
    fields: z.array(looseFieldSchema).min(2).max(12),
  })).min(1).max(4),
  pages: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    route: z.string().startsWith("/"),
    purpose: z.string().min(10),
    components: z.array(z.object({
      type: z.enum(["table", "form", "dashboard", "kanban", "calendar", "detail", "chart"]),
      title: z.string().min(1),
      entityName: z.string().optional(),
    })).min(1).max(5),
  })).min(2).max(5),
  workflows: z.array(z.object({
    title: z.string().min(1),
    steps: z.array(z.string().min(1)).min(2),
  })).min(1).max(5),
  decisions: z.array(z.object({
    title: z.string().min(1),
    decision: z.string().min(1),
    reason: z.string().min(1),
    tradeoff: z.string().min(1),
  })).min(1).max(8),
  seedData: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
})

type LooseBlueprint = z.infer<typeof looseBlueprintSchema>

const entityTerms: Array<[string, string]> = [
  ["联系人", "Contact"],
  ["客户", "Customer"],
  ["线索", "Lead"],
  ["商机", "Opportunity"],
  ["跟进", "FollowUp"],
  ["任务", "Task"],
  ["销售", "Sale"],
  ["用户", "User"],
]

const fieldTerms: Array<[string, string]> = [
  ["负责人", "owner"],
  ["客户名称", "customerName"],
  ["联系人", "contact"],
  ["手机号", "phone"],
  ["电话", "phone"],
  ["邮箱", "email"],
  ["邮件", "email"],
  ["名称", "name"],
  ["姓名", "name"],
  ["状态", "status"],
  ["阶段", "stage"],
  ["日期", "date"],
  ["时间", "date"],
  ["备注", "notes"],
  ["描述", "description"],
  ["分数", "score"],
  ["金额", "amount"],
  ["来源", "source"],
]

const pageTerms: Array<[string, string]> = [
  ["仪表盘", "dashboard"],
  ["看板", "kanban"],
  ["线索", "leads"],
  ["客户", "customers"],
  ["联系人", "contacts"],
  ["商机", "opportunities"],
  ["跟进", "follow-ups"],
  ["任务", "tasks"],
]

function wordsFromAscii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function semanticBase(value: string, terms: Array<[string, string]>, fallback: string) {
  const matched = terms.find(([term]) => value.includes(term))
  if (matched) return matched[1]

  const words = wordsFromAscii(value)
  return words.length ? words.join(" ") : fallback
}

function toPascalIdentifier(value: string, fallback: string) {
  const base = semanticBase(value, entityTerms, fallback)
  const words = wordsFromAscii(base)
  const identifier = words.map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`).join("")
  return /^[A-Z][a-zA-Z0-9]*$/.test(identifier) ? identifier : fallback
}

function toCamelIdentifier(value: string, fallback: string) {
  const base = semanticBase(value, fieldTerms, fallback)
  const words = wordsFromAscii(base)
  const [first = fallback, ...rest] = words
  const identifier = [
    first.toLowerCase(),
    ...rest.map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`),
  ].join("")
  return /^[a-z][a-zA-Z0-9]*$/.test(identifier) ? identifier : fallback
}

function toKebabIdentifier(value: string, fallback: string) {
  const base = semanticBase(value, pageTerms, fallback)
  const identifier = wordsFromAscii(base).join("-").toLowerCase()
  return /^[a-z0-9-]+$/.test(identifier) ? identifier : fallback
}

function uniqueIdentifier(candidate: string, used: Set<string>, separator = "") {
  let next = candidate
  let index = 2
  while (used.has(next)) {
    next = `${candidate}${separator}${index}`
    index += 1
  }
  used.add(next)
  return next
}

function remapSeedRecord(record: Record<string, unknown>, fieldMap: Map<string, string>) {
  const next: Record<string, JsonValue> = {}

  Object.entries(record).forEach(([key, value]) => {
    const nextKey = fieldMap.get(key) ?? toCamelIdentifier(key, key)
    next[nextKey] = value as JsonValue
  })

  return next
}

export function normalizeGeneratedBlueprint(blueprint: LooseBlueprint): ProductBlueprint {
  const entityNameMap = new Map<string, string>()
  const fieldNameMaps = new Map<string, Map<string, string>>()
  const usedEntityNames = new Set<string>()

  const entities = blueprint.entities.map((entity, entityIndex) => {
    const normalizedEntityName = uniqueIdentifier(
      toPascalIdentifier(entity.name || entity.label, `Entity${entityIndex + 1}`),
      usedEntityNames,
    )
    entityNameMap.set(entity.name, normalizedEntityName)
    entityNameMap.set(entity.label, normalizedEntityName)

    const usedFieldNames = new Set<string>()
    const fieldMap = new Map<string, string>()
    const fields = entity.fields.map((field, fieldIndex) => {
      const normalizedFieldName = uniqueIdentifier(
        toCamelIdentifier(field.name || field.label, `field${fieldIndex + 1}`),
        usedFieldNames,
      )
      fieldMap.set(field.name, normalizedFieldName)
      fieldMap.set(field.label, normalizedFieldName)
      return { ...field, name: normalizedFieldName }
    })

    fieldNameMaps.set(normalizedEntityName, fieldMap)
    return { ...entity, name: normalizedEntityName, fields }
  })

  const usedPageIds = new Set<string>()
  const pages = blueprint.pages.map((page, pageIndex) => {
    const pageId = uniqueIdentifier(toKebabIdentifier(page.id || page.name, `page-${pageIndex + 1}`), usedPageIds, "-")
    return {
      ...page,
      id: pageId,
      route: page.route === "/" ? "/" : `/${pageId}`,
      components: page.components.map((component) => ({
        ...component,
        entityName: component.entityName ? (entityNameMap.get(component.entityName) ?? component.entityName) : undefined,
      })),
    }
  })

  const seedData = Object.fromEntries(
    Object.entries(blueprint.seedData).flatMap(([entityName, rows]) => {
      const normalizedEntityName = entityNameMap.get(entityName)
      if (!normalizedEntityName) return []
      const fieldMap = fieldNameMaps.get(normalizedEntityName) ?? new Map<string, string>()
      return [[normalizedEntityName, rows.map((row) => remapSeedRecord(row, fieldMap))]]
    }),
  )

  return productBlueprintSchema.parse({ ...blueprint, entities, pages, seedData })
}

export async function createBlueprint(input: z.infer<typeof createBlueprintInputSchema>) {
  const rawBlueprint = await generateStructuredObject({
    schema: looseBlueprintSchema,
    system:
      `你是 VentureFlow 的 Product Blueprint Agent。请把 Strategy 转成可生成应用的产品蓝图，严格控制在 MVP 能力边界内，实体不超过 4 个，页面不超过 5 个。

标识符规则：
- entities[].name 使用英文 PascalCase，例如 Lead、Customer、FollowUp。
- entities[].fields[].name 使用英文 camelCase，例如 name、status、nextFollowUpDate。
- pages[].id 使用英文 kebab-case，例如 leads、sales-dashboard。
- components[].entityName 必须引用 entities[].name。
- seedData 的 key 必须使用 entities[].name，seed row 字段必须使用 fields[].name。
- 中文说明请放在 label、name、title、description、purpose 等面向用户字段里。`,
    prompt: JSON.stringify(input, null, 2),
  })

  return normalizeGeneratedBlueprint(rawBlueprint)
}

export const createBlueprintTool = createTool({
  id: "create_blueprint",
  description: "基于 Strategy 生成可校验、可生成应用的 Product Blueprint。",
  strict: true,
  inputSchema: createBlueprintInputSchema,
  outputSchema: productBlueprintSchema,
  execute: async (inputData) => createBlueprint(inputData),
})

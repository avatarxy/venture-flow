import { z } from "zod"
import { jsonValueSchema } from "./json"
import { appPatternSchema } from "./strategy"

export const fieldTypeSchema = z.enum(["string", "number", "boolean", "date", "status", "select", "text"])

export const fieldSchema = z.object({
  name: z.string().regex(/^[a-z][a-zA-Z0-9]*$/),
  label: z.string().min(1),
  type: fieldTypeSchema,
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
})

export const entitySchema = z.object({
  name: z.string().regex(/^[A-Z][a-zA-Z0-9]*$/),
  label: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(fieldSchema).min(1).max(12),
})

export const componentSchema = z.object({
  type: z.enum(["table", "form", "dashboard", "kanban", "calendar", "detail", "chart"]),
  title: z.string().min(1),
  entityName: z.string().optional(),
})

export const pageSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  route: z.string().startsWith("/"),
  purpose: z.string().min(10),
  components: z.array(componentSchema).min(1).max(5),
})

export const workflowSchema = z.object({
  title: z.string().min(1),
  steps: z.array(z.string().min(1)).min(2),
})

export const productDecisionSchema = z.object({
  title: z.string().min(1),
  decision: z.string().min(1),
  reason: z.string().min(1),
  tradeoff: z.string().min(1),
})

export const productBlueprintSchema = z
  .object({
    productName: z.string().min(2),
    description: z.string().min(20),
    problemSummary: z.string().min(10),
    targetUsers: z.array(z.string().min(1)).min(1),
    goals: z.array(z.string().min(1)).min(1),
    successMetrics: z.array(z.string().min(1)).min(1),
    appPattern: appPatternSchema,
    entities: z.array(entitySchema).min(1).max(6),
    pages: z.array(pageSchema).min(5).max(8),
    workflows: z.array(workflowSchema).min(1).max(8),
    decisions: z.array(productDecisionSchema).min(1).max(10),
    seedData: z.record(z.string(), z.array(z.record(z.string(), jsonValueSchema))),
  })
  .superRefine((blueprint, ctx) => {
    const entityNames = new Set<string>()

    blueprint.entities.forEach((entity, entityIndex) => {
      if (entityNames.has(entity.name)) {
        ctx.addIssue({
          code: "custom",
          message: "实体名称不能重复",
          path: ["entities", entityIndex, "name"],
        })
      }
      entityNames.add(entity.name)

      const fieldNames = new Set<string>()
      entity.fields.forEach((field, fieldIndex) => {
        if (fieldNames.has(field.name)) {
          ctx.addIssue({
            code: "custom",
            message: "字段名称不能重复",
            path: ["entities", entityIndex, "fields", fieldIndex, "name"],
          })
        }
        fieldNames.add(field.name)
      })
    })

    const pageIds = new Set<string>()
    const pageRoutes = new Set<string>()

    blueprint.pages.forEach((page, pageIndex) => {
      if (pageIds.has(page.id)) {
        ctx.addIssue({ code: "custom", message: "页面 id 不能重复", path: ["pages", pageIndex, "id"] })
      }
      pageIds.add(page.id)

      if (pageRoutes.has(page.route)) {
        ctx.addIssue({ code: "custom", message: "页面 route 不能重复", path: ["pages", pageIndex, "route"] })
      }
      pageRoutes.add(page.route)

      page.components.forEach((component, componentIndex) => {
        if (component.entityName && !entityNames.has(component.entityName)) {
          ctx.addIssue({
            code: "custom",
            message: "组件引用的实体必须在 entities 中定义",
            path: ["pages", pageIndex, "components", componentIndex, "entityName"],
          })
        }
      })
    })

    Object.keys(blueprint.seedData).forEach((entityName) => {
      if (!entityNames.has(entityName)) {
        ctx.addIssue({ code: "custom", message: "seedData 只能使用已定义实体", path: ["seedData", entityName] })
      }
    })
  })

export type FieldType = z.infer<typeof fieldTypeSchema>
export type Field = z.infer<typeof fieldSchema>
export type Entity = z.infer<typeof entitySchema>
export type Component = z.infer<typeof componentSchema>
export type Page = z.infer<typeof pageSchema>
export type Workflow = z.infer<typeof workflowSchema>
export type ProductDecision = z.infer<typeof productDecisionSchema>
export type ProductBlueprint = z.infer<typeof productBlueprintSchema>

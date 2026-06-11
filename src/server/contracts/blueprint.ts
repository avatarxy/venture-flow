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
  fields: z.array(fieldSchema).min(2).max(12),
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

export const productBlueprintSchema = z.object({
  productName: z.string().min(2),
  description: z.string().min(20),
  problemSummary: z.string().min(10),
  targetUsers: z.array(z.string().min(1)).min(1),
  goals: z.array(z.string().min(1)).min(1),
  successMetrics: z.array(z.string().min(1)).min(1),
  appPattern: appPatternSchema,
  entities: z.array(entitySchema).min(1).max(4),
  pages: z.array(pageSchema).min(2).max(5),
  workflows: z.array(workflowSchema).min(1).max(5),
  decisions: z.array(productDecisionSchema).min(1).max(8),
  seedData: z.record(z.string(), z.array(z.record(z.string(), jsonValueSchema))),
})

export type FieldType = z.infer<typeof fieldTypeSchema>
export type Field = z.infer<typeof fieldSchema>
export type Entity = z.infer<typeof entitySchema>
export type Component = z.infer<typeof componentSchema>
export type Page = z.infer<typeof pageSchema>
export type Workflow = z.infer<typeof workflowSchema>
export type ProductDecision = z.infer<typeof productDecisionSchema>
export type ProductBlueprint = z.infer<typeof productBlueprintSchema>

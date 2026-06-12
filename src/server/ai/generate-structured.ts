import { generateObject } from "ai"
import type { z } from "zod"
import { parseStructuredJson } from "./json-output"
import { primaryModel } from "./model"

export async function generateStructuredObject<T>(input: {
  schema: z.ZodType<T>
  system: string
  prompt: string
}) {
  const result = await generateObject({
    model: primaryModel,
    schema: input.schema,
    system: input.system,
    prompt: input.prompt,
  })

  return parseStructuredJson(input.schema, result.object)
}

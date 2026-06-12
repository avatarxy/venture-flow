import { generateObject, jsonSchema as wrapJsonSchema } from "ai"
import type { z } from "zod"
import { parseStructuredJson } from "./json-output"
import { getPrimaryModel } from "./model"

/**
 * Recursively strip unsupported JSON Schema keywords from the schema
 * before sending it to the AI provider.
 *
 * Some AI providers (e.g. OpenAI-compatible) reject draft-07 / draft-2020-12
 * keywords they haven't implemented. The most common offender is
 * `propertyNames`, which Zod v4 auto-generates for `z.record()` schemas.
 */
function stripUnsupportedKeywords(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map(stripUnsupportedKeywords)
  }

  if (schema !== null && typeof schema === "object") {
    const cleaned: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
      // `propertyNames` is not supported by some OpenAI-compatible providers.
      // Removing it is safe: the model still understands `additionalProperties`.
      if (key === "propertyNames") continue
      cleaned[key] = stripUnsupportedKeywords(value)
    }

    return cleaned
  }

  return schema
}

export async function generateStructuredObject<T>(input: {
  schema: z.ZodType<T>
  system: string
  prompt: string
}) {
  // Zod v4 exposes .toJSONSchema() on every schema instance.
  const rawSchema = (input.schema as { toJSONSchema?: () => Record<string, unknown> }).toJSONSchema?.()
  if (!rawSchema) {
    throw new Error("Unable to convert Zod schema to JSON Schema — is Zod v4 installed?")
  }

  const cleanedSchema = stripUnsupportedKeywords(rawSchema) as Record<string, unknown>

  const result = await generateObject({
    model: getPrimaryModel(),
    schema: wrapJsonSchema(cleanedSchema),
    system: input.system,
    prompt: input.prompt,
  })

  return parseStructuredJson(input.schema, result.object)
}

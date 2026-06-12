import { z } from "zod"

const sandpackRuntimeFiles = new Set([
  "/package.json",
  "/index.html",
  "/src/main.tsx",
  "/src/index.css",
  "/tailwind.config.cjs",
  "/postcss.config.cjs",
  "/tailwind.config.js",
  "/postcss.config.js",
  "/vite.config.ts",
  "/tsconfig.json",
  "/vite-env.d.ts",
  "/index.tsx",
  "/styles.css",
  "/tsconfig.node.json",
])

export const patchRequestSchema = z
  .object({
    goal: z.string().trim().min(1),
    recommendation: z.string().trim().min(1),
    targetFiles: z.array(z.string().startsWith("/")).min(1),
    constraints: z.array(z.string().trim().min(1)).min(1),
  })
  .superRefine((patchRequest, ctx) => {
    patchRequest.targetFiles.forEach((targetFile, index) => {
      if (sandpackRuntimeFiles.has(targetFile)) {
        ctx.addIssue({
          code: "custom",
          message: `Patch request cannot target Sandpack runtime file: ${targetFile}`,
          path: ["targetFiles", index],
        })
      }
    })
  })

export type PatchRequest = z.infer<typeof patchRequestSchema>

import { z } from "zod"

export const appEntrypointPath = "/App.tsx"

export const generatedFilePathSchema = z.string().regex(/^\/(?:[A-Za-z0-9][A-Za-z0-9._-]*\/)*[A-Za-z0-9][A-Za-z0-9._-]*$/)

export const generatedFileSchema = z.object({
  path: generatedFilePathSchema,
  content: z.string().min(1),
})

export const buildOutputSchema = z
  .object({
    summary: z.string().min(1),
    files: z.array(generatedFileSchema).min(1),
  })
  .superRefine((build, ctx) => {
    const filePaths = new Set<string>()

    build.files.forEach((file, index) => {
      if (filePaths.has(file.path)) {
        ctx.addIssue({ code: "custom", message: "生成文件路径不能重复", path: ["files", index, "path"] })
      }
      filePaths.add(file.path)
    })

    if (!filePaths.has(appEntrypointPath)) {
      ctx.addIssue({ code: "custom", message: "生成应用必须包含 /App.tsx 入口文件", path: ["files"] })
    }
  })

export type GeneratedFilePath = z.infer<typeof generatedFilePathSchema>
export type GeneratedFile = z.infer<typeof generatedFileSchema>
export type BuildOutput = z.infer<typeof buildOutputSchema>

import type { BuildOutput } from "@/server/contracts"

const disallowedControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/
const disallowedControlCharactersGlobal = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function hasDisallowedControlCharacters(content: string) {
  return disallowedControlCharacters.test(content)
}

export function sanitizeGeneratedFileContent(content: string) {
  return content.replace(disallowedControlCharactersGlobal, "").replace(/^\uFEFF/, "")
}

export function sanitizeGeneratedBuild(build: BuildOutput): BuildOutput {
  return {
    ...build,
    files: build.files.map((file) => ({
      ...file,
      content: sanitizeGeneratedFileContent(file.content),
    })),
  }
}

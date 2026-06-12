import { PublicPreviewShell } from "@/components/generated-preview/PublicPreviewShell"
import { getPublicPreviewVersion } from "@/server/preview/public-preview"

type PreviewPageProps = {
  params: Promise<{
    projectId: string
    versionId: string
  }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { projectId, versionId } = await params
  const version = await getPublicPreviewVersion({ projectId, versionId })

  if (!version) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Preview not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">这个公开预览不存在，或保存的应用文件无法运行。</p>
        </div>
      </main>
    )
  }

  return <PublicPreviewShell files={version.files} />
}

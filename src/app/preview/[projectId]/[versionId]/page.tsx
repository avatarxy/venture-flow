type PreviewPageProps = {
  params: Promise<{
    projectId: string
    versionId: string
  }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { projectId, versionId } = await params

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Public Preview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Project {projectId} / Version {versionId}
        </p>
      </div>
      <section className="min-h-[520px] rounded-lg border border-border p-6 text-sm text-muted-foreground">
        Sandpack Preview Runtime 会在后续模块接入。
      </section>
    </main>
  )
}

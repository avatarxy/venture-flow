type ProjectPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params

  return (
    <main className="mx-auto grid max-w-7xl gap-4 px-6 py-6 lg:grid-cols-[280px_1fr_320px]">
      <aside className="rounded-lg border border-border p-4">
        <h1 className="text-sm font-semibold">Agent Timeline</h1>
        <p className="mt-2 text-xs text-muted-foreground">Project: {projectId}</p>
      </aside>
      <section className="min-h-[560px] rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold">Workspace</h2>
        <p className="mt-2 text-sm text-muted-foreground">Strategy、Blueprint、Preview 和 Analytics 会在后续模块接入。</p>
      </section>
      <aside className="rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold">Build Inspector</h2>
        <p className="mt-2 text-xs text-muted-foreground">生成文件树和编译状态会在后续模块接入。</p>
      </aside>
    </main>
  )
}

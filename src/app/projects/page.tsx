import { Plus } from "lucide-react"

export default function ProjectsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-2 text-sm text-muted-foreground">管理从业务问题生成的解决方案项目。</p>
        </div>
        <button className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground shadow-[var(--shadow-button-gold-inset)]">
          <Plus className="size-4" aria-hidden="true" />
          New project
        </button>
      </section>
      <section className="rounded-lg border border-dashed border-[var(--color-border-interactive)] p-8 text-sm text-muted-foreground">
        项目创建、Generation Timeline 和 Workspace UI 会在后续模块接入。
      </section>
    </main>
  )
}

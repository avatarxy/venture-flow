import { Boxes, ChartNoAxesCombined, ShieldCheck } from "lucide-react"
import { CreateProjectForm } from "@/components/projects/CreateProjectForm"

const capabilities = [
  {
    title: "Strategy",
    description: "把业务问题拆成目标用户、痛点、结果指标和假设。",
    icon: ShieldCheck,
  },
  {
    title: "Blueprint",
    description: "生成可校验的产品蓝图，作为应用生成前的受控契约。",
    icon: Boxes,
  },
  {
    title: "Iteration",
    description: "基于真实使用事件分析效果，再生成改进版本。",
    icon: ChartNoAxesCombined,
  },
]

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-6xl flex-col gap-8 px-6 py-8 md:py-12">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
            Problem-first AI solution builder
          </div>
          <div className="max-w-3xl space-y-4">
            <h1 className="text-5xl font-semibold leading-[1.05] md:text-6xl">VentureFlow</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              从业务问题出发，生成可运行、可分析、可迭代的业务应用。
            </p>
          </div>
          <CreateProjectForm />
          <p className="text-sm text-muted-foreground">试试：销售团队在用 Excel 管理客户，经常漏跟线索。</p>
        </div>
        <div className="border border-border bg-[rgba(252,251,248,0.55)] p-5 [border-radius:8px]">
          <div className="space-y-4">
            <p className="text-sm font-semibold">MVP Flow</p>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li>1. 输入业务问题</li>
              <li>2. Agent 生成 Strategy 与 Blueprint</li>
              <li>3. Sandpack 运行 React App</li>
              <li>4. Usage Analytics 驱动改进版本</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {capabilities.map((capability) => {
          const Icon = capability.icon

          return (
            <article key={capability.title} className="border border-border p-5 [border-radius:8px]">
              <Icon className="mb-4 size-5 text-[var(--color-gold)]" aria-hidden="true" />
              <h2 className="text-lg font-semibold">{capability.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{capability.description}</p>
            </article>
          )
        })}
      </section>
    </main>
  )
}

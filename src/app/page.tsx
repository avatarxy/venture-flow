import { ArrowRight, Boxes, ChartNoAxesCombined, ShieldCheck } from "lucide-react"
import Link from "next/link"

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
    <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-6xl flex-col gap-10 px-6 py-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
            Problem-first AI solution builder
          </div>
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">VentureFlow</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              从业务问题出发，生成可运行、可分析、可迭代的业务应用。
            </p>
          </div>
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm text-primary-foreground shadow-[var(--shadow-button-gold-inset)] hover:bg-[var(--color-gold-hover)]"
            href="/projects"
          >
            进入项目工作台
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-[rgba(252,251,248,0.55)] p-5">
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
            <article key={capability.title} className="rounded-lg border border-border p-5">
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

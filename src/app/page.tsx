import { Boxes, ChartNoAxesCombined, ShieldCheck } from "lucide-react"
import { HomeHero } from "@/components/home/HomeHero"

const capabilities = [
  {
    title: "策略分析",
    description: "把业务问题拆成目标用户、痛点、结果指标和假设。",
    icon: ShieldCheck,
  },
  {
    title: "产品蓝图",
    description: "生成可校验的产品蓝图，作为应用生成前的受控契约。",
    icon: Boxes,
  },
  {
    title: "迭代优化",
    description: "基于真实使用事件分析效果，再生成改进版本。",
    icon: ChartNoAxesCombined,
  },
]

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-61px)] max-w-6xl flex-col gap-8 px-6 py-8 md:py-12">
      <HomeHero />

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

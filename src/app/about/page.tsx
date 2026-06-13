import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <div className="space-y-4 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-[var(--color-gold-subtle)]">
          <Sparkles className="size-6 text-[var(--color-gold)]" />
        </span>
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.6px]">
          关于 VentureFlow
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          从问题到产品，一步到位
        </p>
      </div>

      <article className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          VentureFlow 是一个 Problem-first AI Agent 应用。它的核心理念很简单：大多数业务软件的失败不是因为代码写得不好，是因为一开始就没搞对需求。
        </p>

        <p>
          你描述一个业务问题——"销售团队用 Excel 管客户，跟进经常漏"——Agent 自己完成分析、设计、编码、数据追踪、迭代优化。你要做的就两件事：描述问题、在关键节点确认方向。
        </p>

        <p>
          团队相信 AI 应该帮人从"怎么做"中解放出来，把精力留给"做什么"和"为什么做"。VentureFlow 不是代码补全工具，不是低代码平台，是一个理解业务问题的产品搭档。
        </p>

        <p>
          产品目前在 MVP 阶段，支持从单一业务问题出发生成完整的 React 应用原型，并基于真实使用数据迭代优化。团队持续打磨 Problem-first 方法论和 Agent 自治边界，让每一次生成都更贴近真实业务场景。
        </p>

        <p>
          如果你有业务问题想用 VentureFlow 解决，或者单纯对这个方向有兴趣，随时开始使用——不用注册也能创建项目。
        </p>

        <p>
          如果你想交流产品想法、反馈问题或讨论合作，可以通过邮箱联系我：
          <Link className="ml-1 font-medium text-foreground underline underline-offset-4" href="mailto:imicroding@gmail.com">
            imicroding@gmail.com
          </Link>
        </p>
      </article>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2  px-5 py-2.5 text-sm font-medium  shadow-[var(--shadow-button-inset)] transition hover:opacity-90"
        >
          开始使用
        </Link>
      </div>
    </main>
  )
}

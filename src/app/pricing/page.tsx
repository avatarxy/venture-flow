import { Check, Minus, Sparkles, Zap, Building2, ArrowRight } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Mock 数据                                                         */
/* ------------------------------------------------------------------ */

const plans = [
  {
    name: "Free",
    desc: "体验 AI 驱动的应用生成，适合个人探索与原型验证。",
    price: "¥0",
    period: "永久免费",
    cta: "免费开始",
    href: "/",
    highlight: false,
    icon: Sparkles,
    features: [
      { name: "每月 3 次应用生成", included: true },
      { name: "基础策略分析", included: true },
      { name: "单个项目空间", included: true },
      { name: "Sandpack 实时预览", included: true },
      { name: "社区邮件支持", included: true },
      { name: "自定义品牌", included: false },
      { name: "多项目协作", included: false },
      { name: "高级分析面板", included: false },
      { name: "私有部署", included: false },
      { name: "SLA 保障", included: false },
    ],
  },
  {
    name: "Starter",
    desc: "为小型团队和独立开发者设计的专业版，加速从想法到产品的交付。",
    price: "¥299",
    period: "/ 月",
    cta: "开始试用",
    href: "/register",
    highlight: false,
    icon: Zap,
    badge: "最受欢迎",
    features: [
      { name: "每月 30 次应用生成", included: true },
      { name: "完整策略分析 + 产品蓝图", included: true },
      { name: "最多 5 个项目空间", included: true },
      { name: "Sandpack 实时预览", included: true },
      { name: "AI 二次优化与修复", included: true },
      { name: "基础使用分析", included: true },
      { name: "邮件 + Chat 支持", included: true },
      { name: "自定义品牌", included: false },
      { name: "高级分析面板", included: false },
      { name: "私有部署", included: false },
    ],
  },
  {
    name: "Pro",
    desc: "面向成长型团队的全能力平台，解锁高级分析与协作特性。",
    price: "¥999",
    period: "/ 月",
    cta: "开始试用",
    href: "/register",
    highlight: true,
    icon: Building2,
    features: [
      { name: "无限次应用生成", included: true },
      { name: "完整策略 + 蓝图 + 迭代优化", included: true },
      { name: "无限项目空间", included: true },
      { name: "Sandpack 实时预览", included: true },
      { name: "AI 二次优化与修复", included: true },
      { name: "高级使用分析面板", included: true },
      { name: "自定义品牌与域名", included: true },
      { name: "多成员协作", included: true },
      { name: "优先邮件 + Chat 支持", included: true },
      { name: "私有部署", included: false },
    ],
  },
  {
    name: "Enterprise",
    desc: "为大型组织提供专属部署、安全合规与定制化 AI 能力。",
    price: "定制报价",
    period: "",
    cta: "联系销售",
    href: "/contact",
    highlight: false,
    icon: Building2,
    features: [
      { name: "无限次应用生成", included: true },
      { name: "全能力平台", included: true },
      { name: "无限项目空间", included: true },
      { name: "Sandpack 实时预览", included: true },
      { name: "AI 优化、修复与定制 pipeline", included: true },
      { name: "企业级分析面板 + 导出", included: true },
      { name: "完全自定义品牌与白标", included: true },
      { name: "无限成员 + SSO", included: true },
      { name: "专属客户成功经理", included: true },
      { name: "私有部署 / VPC / 本地化", included: true },
    ],
  },
]

/* 常见问题 */
const faqs = [
  {
    q: "Free 方案真的永久免费吗？",
    a: "是的。Free 方案不设时限，每月 3 次生成额度足够你充分体验 VentureFlow 从问题输入到可运行应用的全流程。没有隐藏费用，也无需绑定信用卡。",
  },
  {
    q: "如何从 Free 升级到付费方案？",
    a: "在任何时候都可以在账户设置中升级。升级后历史项目和数据完整保留，生成额度即时生效。Starter 和 Pro 均提供 7 天免费试用。",
  },
  {
    q: "应用生成的结果可以商用吗？",
    a: "是的。你通过 VentureFlow 生成的所有应用、代码和蓝图都归你所有，可自由部署、修改和商用。我们不会使用你的数据训练 AI 模型。",
  },
  {
    q: "支持哪些 AI 模型？可以切换吗？",
    a: "Free 和 Starter 默认使用高性能开源模型，Pro 及以上支持在配置中切换 GPT-4o、Claude 等主流模型，你也可以在连接器中接入自己的 API Key。",
  },
  {
    q: "私有部署需要满足什么条件？",
    a: "Enterprise 方案支持在 AWS / GCP / 阿里云或你的本地数据中心进行私有部署。我们会派遣工程师协助环境配置与安全审计，通常在 2 周内完成上线。",
  },
  {
    q: "能否按年订阅？有折扣吗？",
    a: "可以。Starter 年付 ¥2,888（约 8 折），Pro 年付 ¥9,588（约 8 折）。年付方案额外赠送 2 次 1v1 产品咨询。",
  },
]

/* ------------------------------------------------------------------ */
/* 页面组件                                                           */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      {/* ───── Hero ───── */}
      <section className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="inline-flex rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
          透明定价，按需选择
        </div>
        <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
          选择适合你团队的
          <span className="text-[var(--color-gold)]"> 方案</span>
        </h1>
        <p className="text-base leading-7 text-muted-foreground md:text-lg">
          从个人探索到企业部署，VentureFlow 提供灵活的定价体系。
          所有付费方案均提供 7 天免费试用，随时取消。
        </p>
      </section>

      {/* ───── 定价卡片 ───── */}
      <section className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const Icon = plan.icon

          return (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-6 transition ${
                plan.highlight
                  ? "border-[var(--color-gold)] bg-[var(--color-gold-subtle)] shadow-[rgba(200,141,43,0.12)_0_8px_32px]"
                  : "border-border bg-[rgba(252,251,248,0.45)] hover:border-[var(--color-border-interactive)]"
              }`}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-gold)] px-3 py-0.5 text-xs font-medium text-[var(--color-ink-light)] shadow-[var(--shadow-button-gold-inset)]">
                  {plan.badge}
                </span>
              ) : null}

              {/* 头部 */}
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--color-ink)] text-[var(--color-ink-light)] shadow-[var(--shadow-button-inset)]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold">{plan.name}</h2>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{plan.desc}</p>

              {/* 价格 */}
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                {plan.period ? (
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                ) : null}
              </div>

              {/* CTA */}
              <a
                href={plan.href}
                className={`mb-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition ${
                  plan.highlight
                    ? "bg-[var(--color-gold)] text-[var(--color-ink-light)] shadow-[var(--shadow-button-gold-inset)] hover:bg-[var(--color-gold-hover)]"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {plan.cta}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>

              {/* 功能列表 */}
              <ul className="mt-auto space-y-3 border-t border-border pt-5">
                {plan.features.map((f) => (
                  <li key={f.name} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
                    ) : (
                      <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-30" aria-hidden="true" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground line-through opacity-50"}>
                      {f.name}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </section>

      {/* ───── 功能对比表 ───── */}
      <section className="mt-20">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-2xl font-semibold">功能对比</h2>
          <p className="text-muted-foreground">详细了解各方案包含的核心能力。</p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-[rgba(252,251,248,0.45)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-4 font-semibold text-foreground">功能</th>
                <th className="px-5 py-4 font-semibold text-foreground">Free</th>
                <th className="px-5 py-4 font-semibold text-foreground">Starter</th>
                <th className="px-5 py-4 font-semibold text-[var(--color-gold)]">Pro</th>
                <th className="px-5 py-4 font-semibold text-foreground">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: "应用生成次数", free: "3 次/月", starter: "30 次/月", pro: "无限", ent: "无限" },
                { name: "策略分析", free: "基础", starter: "完整", pro: "完整", ent: "完整" },
                { name: "产品蓝图", free: "—", starter: "✓", pro: "✓", ent: "✓" },
                { name: "迭代优化", free: "—", starter: "手动触发", pro: "智能推荐", ent: "全自动" },
                { name: "Sandpack 预览", free: "✓", starter: "✓", pro: "✓", ent: "✓" },
                { name: "使用分析", free: "—", starter: "基础", pro: "高级面板", ent: "企业面板 + 导出" },
                { name: "项目数量", free: "1", starter: "5", pro: "无限", ent: "无限" },
                { name: "协作成员", free: "—", starter: "—", pro: "最多 10", ent: "无限 + SSO" },
                { name: "自定义品牌", free: "—", starter: "—", pro: "✓", ent: "白标" },
                { name: "私有部署", free: "—", starter: "—", pro: "—", ent: "✓" },
                { name: "技术支持", free: "社区", starter: "邮件 + Chat", pro: "优先支持", ent: "专属客户经理" },
                { name: "SLA", free: "—", starter: "—", pro: "99.5%", ent: "99.9%" },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-[var(--color-gold-subtle)]">
                  <td className="px-5 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{row.free}</td>
                  <td className="px-5 py-3 text-muted-foreground">{row.starter}</td>
                  <td className="px-5 py-3 text-[var(--color-gold)]">{row.pro}</td>
                  <td className="px-5 py-3 text-muted-foreground">{row.ent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="mt-20">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-2xl font-semibold">常见问题</h2>
          <p className="text-muted-foreground">关于定价和方案的更多信息。</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border bg-[rgba(252,251,248,0.45)] transition hover:border-[var(--color-border-interactive)]"
            >
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="ml-2 shrink-0 text-muted-foreground transition group-open:rotate-45">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="mt-20 rounded-2xl border border-[var(--color-gold)] bg-[var(--color-gold-subtle)] px-6 py-12 text-center md:py-16">
        <h2 className="text-2xl font-semibold md:text-3xl">
          还没决定？从 <span className="text-[var(--color-gold)]">Free</span> 开始体验
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          无需信用卡，3 次免费生成额度。觉得好用再升级，随时取消。
        </p>
        <a
          href="/"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 text-sm font-semibold text-[var(--color-ink-light)] shadow-[var(--shadow-button-gold-inset)] transition hover:bg-[var(--color-gold-hover)]"
        >
          免费开始
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </section>
    </main>
  )
}

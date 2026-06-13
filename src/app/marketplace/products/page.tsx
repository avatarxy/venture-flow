import { Search, Star, Download, Eye, Tag, ArrowRight, Sparkles, Clock, Monitor, Image } from "lucide-react"

/* ------------------------------------------------------------------ */
/* 产品截图占位组件 — 品牌色渐变 + 产品名                                */
/* ------------------------------------------------------------------ */

type ThumbnailPlaceholderProps = {
  title: string
  color: string
}

function ThumbnailPlaceholder({ title, color }: ThumbnailPlaceholderProps) {
  return (
    <div
      className="flex aspect-[16/10] items-center justify-center rounded-lg"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 40%, ${color}88 100%)`,
      }}
    >
      <div className="text-center">
        <Monitor className="mx-auto size-8 text-white/60" aria-hidden="true" />
        <p className="mt-2 max-w-[80%] text-xs font-medium leading-tight text-white/90">
          {title.split("—")[0]?.trim() ?? title}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Mock 数据                                                         */
/* ------------------------------------------------------------------ */

const categories = [
  "全部产品", "CRM 客户管理", "数据看板", "工单系统",
  "审批流程", "库存管理", "财务工具", "人事行政",
]

const products = [
  {
    id: "pr-001",
    title: "FlowCRM — 智能销售线索管理",
    author: "DeepWisdom 官方",
    rating: 4.8,
    reviews: 23,
    downloads: 156,
    price: "¥299",
    period: "/ 月",
    color: "#3b6faa",
    description:
      "从线索导入、自动分配、跟进提醒到转化分析的全流程 CRM。集成 AI 评分引擎自动为线索打分，Kanban 视图拖拽管理销售阶段，一键生成周报。",
    features: ["AI 线索评分", "Kanban 看板", "自动跟进提醒", "销售漏斗图表", "数据导出"],
    updated: "3 天前",
  },
  {
    id: "pr-002",
    title: "StockPulse — 多仓库库存实时看板",
    author: "链通科技",
    rating: 4.6,
    reviews: 18,
    downloads: 89,
    price: "¥499",
    period: "/ 月",
    color: "#2d7d46",
    description:
      "聚合多仓库库存数据，实时展示库存水位、周转天数、低库存预警。支持手动录入和 API 对接，自动生成补货建议单。",
    features: ["多仓库聚合", "实时库存看板", "低库存预警", "补货建议", "周转率分析"],
    updated: "5 天前",
  },
  {
    id: "pr-003",
    title: "TicketFlow — 轻量级客户工单系统",
    author: "云帆互联",
    rating: 4.5,
    reviews: 31,
    downloads: 210,
    price: "¥199",
    period: "/ 月",
    color: "#c88d2b",
    description:
      "轻量级工单管理系统，支持邮件转工单、优先级分派、SLA 倒计时和客户自助查询。内置满意度评分和响应时间统计。",
    features: ["邮件转工单", "SLA 倒计时", "客户自助门户", "满意度评分", "响应时间报表"],
    updated: "2 天前",
  },
  {
    id: "pr-004",
    title: "HRFlow — 考勤与请假审批自动化",
    author: "鼎信咨询",
    rating: 4.7,
    reviews: 15,
    downloads: 72,
    price: "¥99",
    period: "/ 月",
    color: "#7c3aed",
    description:
      "员工手机端提交请假/外出申请，主管一键审批，自动汇总到 HR 看板。支持年假余额计算、加班统计和月度出勤报表导出。",
    features: ["移动端申请", "一键审批", "年假余额", "加班统计", "月度报表"],
    updated: "1 周前",
  },
  {
    id: "pr-005",
    title: "LedgerMatch — 财务三表自动对账",
    author: "DeepWisdom 官方",
    rating: 4.9,
    reviews: 12,
    downloads: 48,
    price: "¥599",
    period: "/ 月",
    color: "#1c1c1c",
    description:
      "支持银行流水、ERP 数据、第三方支付平台三方对账。CSV 拖拽导入，智能规则匹配异常交易，一键导出对账报告。",
    features: ["三方对账", "CSV 导入", "规则匹配", "异常标记", "报告导出"],
    updated: "12 小时前",
  },
  {
    id: "pr-006",
    title: "EventDash — 活动报名与数据分析",
    author: "光点文化",
    rating: 4.4,
    reviews: 9,
    downloads: 34,
    price: "免费",
    period: "",
    color: "#c23b3b",
    description:
      "活动报名表单 + 签到核销 + 参与数据分析。支持自定义报名字段、二维码签到、到场率统计和参与者画像分析。",
    features: ["自定义表单", "二维码签到", "到场率统计", "用户画像", "邮件通知"],
    updated: "4 天前",
  },
]

/* 统计 */
const marketStats = [
  { icon: Sparkles, label: "上架产品", value: "48 款" },
  { icon: Download, label: "累计安装", value: "2,340 次" },
  { icon: Star, label: "平均评分", value: "4.7 / 5.0" },
]

/* ------------------------------------------------------------------ */
/* 页面                                                               */
/* ------------------------------------------------------------------ */

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* ───── Hero ───── */}
      <section className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
            双边交易市场
          </div>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
            产品<span className="text-[var(--color-gold)]">集市</span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            浏览和采购已上架的 AI 驱动业务应用。
            一键安装到你的工作空间，即开即用。
          </p>

          {/* 搜索 */}
          <div className="flex gap-2 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                placeholder="搜索产品，如“CRM”、“库存”"
                className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              />
            </div>
          </div>
        </div>

        {/* 上架引导 */}
        <aside className="rounded-xl border border-[var(--color-gold)] bg-[var(--color-gold-subtle)] p-5 text-center lg:mt-2">
          <h3 className="text-base font-semibold">有产品要上架？</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            将你开发的应用上架到产品集市，触达 120+ 企业客户。
          </p>
          <a
            href="/marketplace/products/new"
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-gold)] px-4 text-sm font-medium text-[var(--color-ink-light)] shadow-[var(--shadow-button-gold-inset)] transition hover:bg-[var(--color-gold-hover)]"
          >
            上架产品
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>
        </aside>
      </section>

      {/* 统计 */}
      <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-4">
        {marketStats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-3 px-2">
              <Icon className="size-5 shrink-0 text-[var(--color-gold)]" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 分类标签 */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs transition ${
              cat === "全部产品"
                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-ink-light)]"
                : "border-border bg-[rgba(252,251,248,0.45)] text-muted-foreground hover:border-[var(--color-border-interactive)] hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 产品卡片网格 */}
      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-[rgba(252,251,248,0.45)] transition hover:border-[var(--color-border-interactive)] hover:shadow-[rgba(28,28,28,0.06)_0_12px_32px]"
          >
            {/* 产品截图占位 */}
            <a href="#">
            {/* <a href={`/marketplace/products/${product.id}`}> */}
              <ThumbnailPlaceholder title={product.title} color={product.color} />
            </a>

            <div className="flex flex-1 flex-col p-5">
              {/* 作者 + 时间 */}
              <div className="mb-2.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{product.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {product.updated}
                </span>
              </div>

              {/* 标题 */}
              <h2 className="text-base font-semibold leading-snug transition group-hover:text-[var(--color-gold)]">
                <a href={`/marketplace/products/${product.id}`}>{product.title}</a>
              </h2>

              {/* 描述 */}
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {product.description}
              </p>

              {/* 评分 + 下载 */}
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Star className="size-4 fill-[var(--color-gold)] text-[var(--color-gold)]" aria-hidden="true" />
                  {product.rating}
                </span>
                <span className="text-xs text-muted-foreground">({product.reviews})</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Download className="size-3" />
                  {product.downloads}
                </span>
              </div>

              {/* 标签 */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.features.slice(0, 3).map((f) => (
                  <span key={f} className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    <Tag className="mr-0.5 inline size-2.5" aria-hidden="true" />
                    {f}
                  </span>
                ))}
                {product.features.length > 3 ? (
                  <span className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    +{product.features.length - 3}
                  </span>
                ) : null}
              </div>

              {/* 价格 + CTA */}
              <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold">{product.price}</span>
                  {product.period ? (
                    <span className="text-xs text-muted-foreground">{product.period}</span>
                  ) : null}
                </div>
                <a
                  // href={`/marketplace/products/${product.id}`}
                  href="#"
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-white px-3 text-xs font-semiboldshadow-[var(--shadow-button-inset)] transition hover:opacity-90"
                >
                  <Eye className="size-3" aria-hidden="true" />
                  查看详情
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

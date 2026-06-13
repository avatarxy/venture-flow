import { Search, MapPin, Clock, Tag, ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Mock 数据                                                         */
/* ------------------------------------------------------------------ */

const categories = [
  "全部需求", "销售管理", "库存供应链", "客户服务",
  "数据分析", "财务核算", "人事行政", "项目管理",
]

const briefs = [
  {
    id: "br-001",
    title: "销售线索全流程管理系统",
    company: "锐达科技",
    industry: "B2B SaaS",
    budget: "¥5,000 - 8,000",
    deadline: "14 天后截止",
    description:
      "我们的销售团队目前用 Excel + 微信群跟进 200+ 条线索，经常漏跟、重复分配，管理层看不到转化漏斗。需要一套从线索导入、分配、跟进到转化分析的轻量级 CRM。",
    skills: ["CRM", "看板", "数据分析"],
    proposals: 5,
    location: "远程",
    posted: "2 小时前",
  },
  {
    id: "br-002",
    title: "多仓库库存实时看板",
    company: "鲜品供应链",
    industry: "生鲜物流",
    budget: "¥8,000 - 15,000",
    deadline: "21 天后截止",
    description:
      "三个区域仓库数据分散在各自的 Excel 里，总部每天需要电话沟通才知道库存水位。需要一个聚合看板，实时展示各仓库库存、周转天数和低库存预警。",
    skills: ["数据可视化", "实时同步", "预警系统"],
    proposals: 3,
    location: "上海",
    posted: "5 小时前",
  },
  {
    id: "br-003",
    title: "客户工单流转与 SLA 追踪",
    company: "云帆互联",
    industry: "IT 服务",
    budget: "¥3,000 - 6,000",
    deadline: "30 天后截止",
    description:
      "客户问题通过邮件和电话提交，没有统一的工单系统。技术支持的 SLA 全靠人工记忆，经常超时。需要一个轻量级工单系统，支持优先级分派、SLA 倒计时和客户自助查询进度。",
    skills: ["工单管理", "SLA", "邮件集成"],
    proposals: 7,
    location: "远程",
    posted: "1 天前",
  },
  {
    id: "br-004",
    title: "员工考勤与请假审批自动化",
    company: "鼎信咨询",
    industry: "咨询服务",
    budget: "¥2,000 - 4,000",
    deadline: "10 天后截止",
    description:
      "60 人团队目前用纸质请假单 + Excel 登记考勤，HR 每月底需要花两天时间手动汇总。希望有一款在线考勤 + 请假审批的小工具，员工手机端提交，主管审批后自动汇总到 HR 看板。",
    skills: ["审批流程", "移动端", "报表"],
    proposals: 9,
    location: "北京",
    posted: "3 小时前",
  },
  {
    id: "br-005",
    title: "财务对账自动化工具",
    company: "众行物流",
    industry: "物流运输",
    budget: "¥6,000 - 10,000",
    deadline: "28 天后截止",
    description:
      "每月需要将银行流水、内部 ERP 和第三方支付平台的三份数据做核对，目前由财务手工操作耗时 3 天，且容易出错。需要一个自动化对账工具，支持 CSV 导入、规则匹配和异常标记。",
    skills: ["数据处理", "自动化", "报表导出"],
    proposals: 4,
    location: "远程",
    posted: "2 天前",
  },
  {
    id: "br-006",
    title: "活动报名与参与数据分析",
    company: "光点文化",
    industry: "文化传媒",
    budget: "¥4,000 - 7,000",
    deadline: "20 天后截止",
    description:
      "每月举办 3-5 场线下沙龙和线上直播，目前使用金数据收集报名但无法做后续分析。需要一个报名管理 + 参与数据分析工具，支持签到核销、到场率统计和参与者画像。",
    skills: ["表单", "数据分析", "用户画像"],
    proposals: 2,
    location: "深圳",
    posted: "6 小时前",
  },
]

/* 热门行业标签 */
const hotTags = ["B2B SaaS", "生鲜物流", "IT 服务", "咨询服务", "文化传媒", "教育培训", "医疗健康"]

/* 发布按钮数据 */
const publishStats = [
  { icon: Users, label: "活跃需求方", value: "120+ 企业" },
  { icon: TrendingUp, label: "本月新增需求", value: "34 条" },
  { icon: DollarSign, label: "平均项目预算", value: "¥5,600" },
]

/* ------------------------------------------------------------------ */
/* 页面                                                               */
/* ------------------------------------------------------------------ */

export default function BriefsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* ───── Hero ───── */}
      <section className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
            双边交易市场
          </div>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
            需求<span className="text-[var(--color-gold)]">广场</span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            企业发布业务需求，AI 开发者或服务商接单交付。
            从需求描述到可运行的 Web 应用，一站式匹配。
          </p>

          {/* 搜索 */}
          <div className="flex gap-2 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                placeholder="搜索需求，如“CRM”、“库存管理”"
                className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              />
            </div>
          </div>
        </div>

        {/* 发布引导卡 */}
        <aside className="rounded-xl border border-[var(--color-gold)] bg-[var(--color-gold-subtle)] p-5 text-center lg:mt-2">
          <h3 className="text-base font-semibold">有业务需求？</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            免费发布需求，AI 开发者与解决方案团队将在 24 小时内响应。
          </p>
          <a
            href="/marketplace/briefs/new"
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-gold)] px-4 text-sm font-medium text-[var(--color-ink-light)] shadow-[var(--shadow-button-gold-inset)] transition hover:bg-[var(--color-gold-hover)]"
          >
            发布需求
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>
        </aside>
      </section>

      {/* 统计条 */}
      <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-4">
        {publishStats.map((s) => {
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

      {/* 行业标签 */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs transition ${
              cat === "全部需求"
                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-ink-light)]"
                : "border-border bg-[rgba(252,251,248,0.45)] text-muted-foreground hover:border-[var(--color-border-interactive)] hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 需求列表 */}
      <section className="mt-8 space-y-4">
        {briefs.map((brief) => (
          <article
            key={brief.id}
            className="group rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-5 transition hover:border-[var(--color-border-interactive)] md:px-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1 space-y-2.5">
                {/* 标题行 */}
                <div className="flex items-start gap-3">
                  <h2 className="text-base font-semibold leading-snug transition group-hover:text-[var(--color-gold)]">
                    <a href={`/marketplace/briefs/${brief.id}`}>{brief.title}</a>
                  </h2>
                  <span className="mt-0.5 shrink-0 rounded border border-border px-1.5 py-0 text-[10px] text-muted-foreground">
                    {brief.industry}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {brief.description}
                </p>

                {/* 元信息 */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {brief.location}
                  </span>
                  <span>预算：{brief.budget}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {brief.deadline}
                  </span>
                  <span>发布：{brief.posted}</span>
                </div>
              </div>

              {/* 右侧信息 */}
              <div className="flex shrink-0 flex-row items-center gap-4 md:flex-col md:items-end md:gap-3">
                <span className="rounded-full bg-[var(--color-gold-light)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-gold)]">
                  {brief.proposals} 人感兴趣
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {brief.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      <Tag className="mr-0.5 inline size-2.5" aria-hidden="true" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

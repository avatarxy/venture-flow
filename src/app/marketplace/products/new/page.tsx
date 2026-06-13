import { Package, Send, ArrowLeft, Info, Upload } from "lucide-react"
import Link from "next/link"

/* ------------------------------------------------------------------ */
/* 上架产品表单页面                                                     */
/* ------------------------------------------------------------------ */

export default function NewProductPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      {/* 返回 */}
      <Link
        href="/marketplace/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回产品集市
      </Link>

      {/* 标题 */}
      <div className="space-y-3">
        <div className="inline-flex rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
          触达 120+ 企业客户
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          上架你的<span className="text-[var(--color-gold)]">产品</span>
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          将你开发的应用发布到产品集市，让更多企业发现并使用你的产品。
          审核通过后即可上线，支持设置定价和免费试用。
        </p>
      </div>

      {/* 提示卡片 */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-[rgba(252,251,248,0.55)] p-4">
        <Info className="mt-0.5 size-5 shrink-0 text-[var(--color-gold)]" aria-hidden="true" />
        <div className="text-sm leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">上架须知：</strong>
          产品将由审核团队在 1-3 个工作日内完成审核。请确保产品截图清晰展示核心功能，
          描述准确反映实际能力。上架后可在"产品集市"后台查看安装数据和用户评价。
        </div>
      </div>

      {/* 表单 */}
      <form className="mt-8 space-y-6">
        {/* 产品名称 */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold text-foreground">
            产品名称 <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="例如：FlowCRM — 智能销售线索管理"
            className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
        </div>

        {/* 分类 */}
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-semibold text-foreground">
            产品分类 <span className="text-[var(--color-error)]">*</span>
          </label>
          <select
            id="category"
            defaultValue=""
            className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          >
            <option value="" disabled>
              请选择分类
            </option>
            <option value="crm">CRM 客户管理</option>
            <option value="dashboard">数据看板</option>
            <option value="ticket">工单系统</option>
            <option value="workflow">审批流程</option>
            <option value="inventory">库存管理</option>
            <option value="finance">财务工具</option>
            <option value="hr">人事行政</option>
            <option value="other">其他</option>
          </select>
        </div>

        {/* 产品截图 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            产品截图 <span className="text-[var(--color-error)]">*</span>
          </label>
          <p className="text-xs text-muted-foreground">
            上传 2-4 张产品界面截图（推荐 1280×800，PNG 或 JPG，单张不超过 2MB）。
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-[rgba(252,251,248,0.35)] text-muted-foreground transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                <Upload className="size-6" aria-hidden="true" />
                <span className="text-xs">{i === 0 ? "主图（必传）" : `附图 ${i + 1}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 产品描述 */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-semibold text-foreground">
            产品描述 <span className="text-[var(--color-error)]">*</span>
          </label>
          <p className="text-xs text-muted-foreground">
            简明描述产品的核心功能、适用场景和独特优势（建议 100-300 字）。
          </p>
          <textarea
            id="description"
            rows={5}
            placeholder="例如：从线索导入、自动分配、跟进提醒到转化分析的全流程 CRM。集成 AI 评分引擎自动为线索打分，Kanban 视图拖拽管理销售阶段……"
            className="w-full resize-y rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
        </div>

        {/* 核心功能 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            核心功能标签 <span className="text-[var(--color-error)]">*</span>
          </label>
          <p className="text-xs text-muted-foreground">
            选择 3-5 个最能代表产品能力的标签。
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              "AI 智能评分", "Kanban 看板", "自动提醒", "数据可视化",
              "报表导出", "审批流程", "移动端", "邮件集成",
              "API 对接", "权限管理", "实时同步", "CSV 导入",
            ].map((tag) => (
              <label
                key={tag}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-[rgba(252,251,248,0.45)] px-3 py-1.5 text-xs text-muted-foreground transition has-[:checked]:border-[var(--color-gold)] has-[:checked]:bg-[var(--color-gold-subtle)] has-[:checked]:text-[var(--color-gold)] hover:border-[var(--color-border-interactive)]"
              >
                <input type="checkbox" className="sr-only" />
                {tag}
              </label>
            ))}
          </div>
        </div>

        {/* 定价 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="pricing-model" className="text-sm font-semibold text-foreground">
              定价模式 <span className="text-[var(--color-error)]">*</span>
            </label>
            <select
              id="pricing-model"
              defaultValue=""
              className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            >
              <option value="" disabled>
                请选择
              </option>
              <option value="free">免费</option>
              <option value="monthly">按月订阅</option>
              <option value="yearly">按年订阅</option>
              <option value="one-time">一次性买断</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-semibold text-foreground">
              价格（元）
            </label>
            <input
              id="price"
              type="number"
              placeholder="299"
              className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            />
          </div>
        </div>

        {/* 试用期 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">是否提供免费试用</label>
          <div className="flex items-center gap-6 pt-1">
            {[
              { label: "提供 7 天试用", value: "7" },
              { label: "提供 14 天试用", value: "14" },
              { label: "不提供试用", value: "none" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
              >
                <input
                  type="radio"
                  name="trial"
                  value={opt.value}
                  defaultChecked={opt.value === "7"}
                  className="size-4 accent-[var(--color-gold)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* 提交 */}
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 text-sm font-semibold text-[var(--color-ink-light)] shadow-[var(--shadow-button-gold-inset)] transition hover:bg-[var(--color-gold-hover)]"
        >
          <Send className="size-4" aria-hidden="true" />
          提交审核
        </button>
      </form>
    </main>
  )
}

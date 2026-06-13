import { Lightbulb, Send, ArrowLeft, Info } from "lucide-react"
import Link from "next/link"

/* ------------------------------------------------------------------ */
/* 发布需求表单页面                                                     */
/* ------------------------------------------------------------------ */

export default function NewBriefPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      {/* 返回 */}
      <Link
        href="/marketplace/briefs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回需求广场
      </Link>

      {/* 标题 */}
      <div className="space-y-3">
        <div className="inline-flex rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
          免费发布，24 小时内响应
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          发布你的业务<span className="text-[var(--color-gold)]">需求</span>
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          描述你的业务问题，AI 开发者与解决方案团队将与你联系，帮你落地实现。
        </p>
      </div>

      {/* 提示卡片 */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-[rgba(252,251,248,0.55)] p-4">
        <Info className="mt-0.5 size-5 shrink-0 text-[var(--color-gold)]" aria-hidden="true" />
        <div className="text-sm leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">发布须知：</strong>
          需求描述越详细，匹配的解决方案越精准。建议包含业务背景、当前痛点、期望效果和预算范围。
          发布后可在"需求广场"查看响应情况。
        </div>
      </div>

      {/* 表单 */}
      <form className="mt-8 space-y-6">
        {/* 需求标题 */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold text-foreground">
            需求标题 <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="例如：销售线索全流程管理系统"
            className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
        </div>

        {/* 行业 */}
        <div className="space-y-2">
          <label htmlFor="industry" className="text-sm font-semibold text-foreground">
            所属行业 <span className="text-[var(--color-error)]">*</span>
          </label>
          <select
            id="industry"
            defaultValue=""
            className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          >
            <option value="" disabled>
              请选择行业
            </option>
            <option value="saas">B2B SaaS</option>
            <option value="ecommerce">电商零售</option>
            <option value="logistics">物流供应链</option>
            <option value="finance">金融保险</option>
            <option value="healthcare">医疗健康</option>
            <option value="education">教育培训</option>
            <option value="realestate">房地产</option>
            <option value="manufacturing">制造业</option>
            <option value="media">文化传媒</option>
            <option value="other">其他</option>
          </select>
        </div>

        {/* 预算 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="budget-min" className="text-sm font-semibold text-foreground">
              预算下限（元）
            </label>
            <input
              id="budget-min"
              type="number"
              placeholder="2,000"
              className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="budget-max" className="text-sm font-semibold text-foreground">
              预算上限（元）
            </label>
            <input
              id="budget-max"
              type="number"
              placeholder="8,000"
              className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            />
          </div>
        </div>

        {/* 截止日期 */}
        <div className="space-y-2">
          <label htmlFor="deadline" className="text-sm font-semibold text-foreground">
            期望交付时间
          </label>
          <select
            id="deadline"
            defaultValue=""
            className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          >
            <option value="" disabled>
              请选择
            </option>
            <option value="7">一周内</option>
            <option value="14">两周内</option>
            <option value="21">三周内</option>
            <option value="30">一个月内</option>
            <option value="flexible">弹性时间</option>
          </select>
        </div>

        {/* 需求描述 */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-semibold text-foreground">
            需求描述 <span className="text-[var(--color-error)]">*</span>
          </label>
          <p className="text-xs text-muted-foreground">
            请详细描述业务背景、当前痛点、期望功能以及任何特殊需求。
          </p>
          <textarea
            id="description"
            rows={8}
            placeholder="例如：我们的销售团队目前用 Excel + 微信群跟进 200+ 条线索，经常漏跟、重复分配，管理层看不到转化漏斗。需要一套从线索导入、分配、跟进到转化分析的轻量级 CRM……"
            className="w-full resize-y rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
        </div>

        {/* 技能标签 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">所需能力</label>
          <p className="text-xs text-muted-foreground">选择期望应用包含的功能方向（可多选）。</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              "CRM 客户管理", "数据可视化", "审批流程", "库存管理",
              "财务核算", "报表导出", "移动端适配", "API 集成",
              "邮件通知", "权限管理",
            ].map((skill) => (
              <label
                key={skill}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-[rgba(252,251,248,0.45)] px-3 py-1.5 text-xs text-muted-foreground transition has-[:checked]:border-[var(--color-gold)] has-[:checked]:bg-[var(--color-gold-subtle)] has-[:checked]:text-[var(--color-gold)] hover:border-[var(--color-border-interactive)]"
              >
                <input type="checkbox" className="sr-only" />
                {skill}
              </label>
            ))}
          </div>
        </div>

        {/* 联系方式 */}
        <div className="space-y-2">
          <label htmlFor="contact" className="text-sm font-semibold text-foreground">
            联系方式 <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            id="contact"
            type="text"
            placeholder="邮箱或微信号，便于开发者联系你"
            className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3.5 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
        </div>

        {/* 提交 */}
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 text-sm font-semibold text-[var(--color-ink-light)] shadow-[var(--shadow-button-gold-inset)] transition hover:bg-[var(--color-gold-hover)]"
        >
          <Send className="size-4" aria-hidden="true" />
          发布需求
          <span className="text-xs opacity-70">（免费）</span>
        </button>
      </form>
    </main>
  )
}

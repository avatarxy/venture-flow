export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <h1 className="text-3xl font-semibold leading-tight tracking-[-0.6px]">
        服务条款
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">最后更新：2026 年 6 月</p>

      <article className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">服务说明</h2>
          <p>
            VentureFlow 提供基于 AI 的应用生成服务。你描述业务问题，系统自动生成 Strategy、Blueprint、可运行的应用代码和分析报告。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">使用规则</h2>
          <p>使用 VentureFlow 时，你同意：不生成违法内容、不进行恶意攻击、不滥用系统资源。我们保留因违规使用而暂停或终止服务的权利。</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">生成内容</h2>
          <p>
            AI 生成的应用代码、Strategy 分析和 Blueprint 归你所有。系统不对生成内容的准确性或适用性提供担保——AI 输出需要人工审查。特别是涉及财务、医疗、法律等领域的应用，请在使用前由专业人士审核。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">服务可用性</h2>
          <p>
            VentureFlow 目前处于 MVP 阶段，可能随时更新、变更或中断服务。我们尽力保证服务稳定，但不对服务中断造成的损失承担责任。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">责任限制</h2>
          <p>
            在法律允许的范围内，VentureFlow 不对因使用本服务而产生的间接损失承担责任，包括但不限于数据丢失、业务中断或利润损失。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">条款变更</h2>
          <p>
            我们可能随时更新服务条款，更新后在本页面发布。继续使用服务即表示你接受修改后的条款。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">联系我们</h2>
          <p>
            对服务条款有任何疑问，请发送邮件至 legal@ventureflow.dev。
          </p>
        </section>
      </article>
    </main>
  )
}

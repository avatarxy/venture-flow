export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <h1 className="text-3xl font-semibold leading-tight tracking-[-0.6px]">
        隐私政策
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">最后更新：2026 年 6 月</p>

      <article className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">信息收集</h2>
          <p>
            注册时我们收集你的邮箱和姓名，仅用于账号识别和通信。创建项目时记录你输入的业务问题描述，用于 Agent 生成内容。
          </p>
          <p className="mt-2">
            生成应用中记录的操作事件（Usage Events）仅包含操作类型和时间戳，不记录具体的输入内容和个人数据。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">信息使用</h2>
          <p>
            收集的信息用于提供和改进产品服务：邮箱用于登录认证，Usage Events 用于生成优化建议，项目数据用于 Agent 分析。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">数据存储</h2>
          <p>
            所有数据存储在 Supabase PostgreSQL 数据库中，采用加密传输。密码使用 SHA-256 加盐哈希存储，不保存明文。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">数据删除</h2>
          <p>
            你可以随时删除项目和账号。删除操作会移除所有关联数据，不可恢复。如需删除账号，请联系 support@ventureflow.dev。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">Cookie</h2>
          <p>
            登录后使用 httpOnly Cookie 存储认证令牌（7 天有效），不用于追踪或广告目的。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">联系我们</h2>
          <p>
            对隐私政策有任何疑问，请发送邮件至 privacy@ventureflow.dev。
          </p>
        </section>
      </article>
    </main>
  )
}

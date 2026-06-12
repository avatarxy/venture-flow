# VentureFlow MVP Acceptance Checklist

## P0 链路

- [ ] 首页可以输入至少 20 个字符的业务问题。
- [ ] 创建项目后可以进入 Workspace。
- [ ] Agent Timeline 可以展示运行状态。
- [ ] Strategy 输出包含 Facts、Assumptions、Validation Questions 和 Success Metrics。
- [ ] Blueprint 通过 Zod 校验。
- [ ] Build 输出包含 `/App.tsx`。
- [ ] Preview 可以运行生成应用。
- [ ] 生成应用至少支持新增操作。
- [ ] 生成应用至少支持修改或状态变更操作。
- [ ] 生成应用支持搜索、筛选或排序中的至少一种。
- [ ] 生成应用使用 localStorage 持久化。
- [ ] 公开 Preview 可以匿名访问。
- [ ] 公开 Preview 只能读取已发布版本。
- [ ] 公开 Preview 操作可以写入 Usage Events。
- [ ] Analytics 至少展示 3 个统计指标。
- [ ] Growth Agent 的建议引用真实事件数据或明确提示数据不足。
- [ ] Apply Improvement 可以接收受控 patch request。
- [ ] 新版本追加保存，旧版本保留。

## 部署准备

- [ ] `.env` 配置 `DATABASE_URL`、`OPENAI_API_KEY` 和 `NEXT_PUBLIC_APP_URL`。
- [ ] Prisma migration 已应用到 Supabase PostgreSQL。
- [ ] Vercel 项目使用 Next.js framework preset。
- [ ] 服务端日志可以输出结构化 system events。
- [ ] `npm run typecheck` 通过。
- [ ] `npm run test` 通过。
- [ ] `npm run build` 通过。
- [ ] `npm run test:e2e` 通过或记录阻塞原因。

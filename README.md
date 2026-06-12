# VentureFlow

VentureFlow 是一个 Problem-first AI solution builder。用户描述业务问题，系统通过有边界的自治 Agent 生成 Strategy、Product Blueprint、可运行应用、Usage Analytics 和改进版本。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react
- Vercel AI SDK
- Mastra
- Zod
- Prisma
- Supabase PostgreSQL
- Sandpack
- Vitest
- Playwright

## 本地启动

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

环境变量：

```bash
DATABASE_URL=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 测试

```bash
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

## Demo

- Demo script: [docs/demo-script.md](docs/demo-script.md)
- Acceptance checklist: [docs/acceptance-checklist.md](docs/acceptance-checklist.md)

The main demo starts with this business problem:

```text
我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。
```

## 部署与发布

The app is configured for Vercel with `vercel.json`.

Before deploying:

1. Create a Supabase PostgreSQL database.
2. Configure `DATABASE_URL`, `OPENAI_API_KEY`, and `NEXT_PUBLIC_APP_URL` in Vercel Environment Variables.
3. Apply Prisma migrations.
4. Run the verification commands above.

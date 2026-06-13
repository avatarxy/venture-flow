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
DIRECT_URL=
GEMINI_API_KEY=
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
AI_MODEL=gemini-3.1-flash-lite
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

- Demo: [docs/demo-script.md](docs/demo-script.md)
- Checklist: [docs/acceptance-checklist.md](docs/acceptance-checklist.md)

输入业务问题查看 DEMO 效果:

```text
我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。
```

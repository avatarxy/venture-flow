# AGENTS.md

## 项目概览

VentureFlow 是一个 Problem-first AI solution builder。用户输入业务问题，系统通过有边界的自治 Agent 生成：

- Strategy：业务问题分析。
- Product Blueprint：可生成应用的产品蓝图。
- React App：可在 Sandpack 中运行的生成应用。
- Usage Analytics：真实使用事件与指标。
- Improvement Version：基于数据优化后的新版本。

核心产品原则：

- Problem-first：从业务问题出发，而不是从用户指定功能出发。
- 路径自治，结果受控：Agent 可以决定执行路径，系统必须控制工具、Schema、预算和完成条件。
- 生成应用只在浏览器内运行，不执行任意后端代码。
- 所有 AI 输出必须结构化、可校验、可恢复。

## 必读文档

开始任何开发任务前，先按需阅读以下文档：

- `DESIGN.md`：产品设计和整体方向。
- `docs/technical-architecture.md`：技术选型、系统架构、数据流和安全边界。
- `docs/plan/README.md`：模块拆分和推荐执行顺序。
- `docs/plan/*.md`：具体模块开发任务。
- `docs/VentureFlow-prd-mvp.docx`：MVP 产品需求文档。

如果任务涉及某个模块，优先阅读对应计划文档，例如：

- Agent 编排：`docs/plan/04-agent-orchestration.md`
- AI 工具与应用生成：`docs/plan/05-ai-tools-and-generation.md`
- Workspace UI：`docs/plan/06-workspace-ui.md`
- Preview Runtime：`docs/plan/07-preview-runtime.md`
- Analytics 与迭代：`docs/plan/08-analytics-growth-iteration.md`

## 文档与 API 查询规则

所有涉及 API、SDK、框架、第三方库、平台能力或官方文档的开发任务，优先使用 Context7 MCP 查询最新文档。

执行要求：

1. 先使用 Context7 MCP 解析库或框架名称，例如 Next.js、Mastra、Vercel AI SDK、Prisma、Supabase、Sandpack、shadcn/ui、Zod。
2. 再使用 Context7 MCP 拉取对应主题的最新文档，例如 route handlers、createTool、generateObject、Prisma schema、Supabase auth、SandpackProvider。
3. 基于查询到的官方文档实现，不依赖过时记忆。
4. 如果 Context7 MCP 不可用，改查官方文档，并在最终回复中说明使用了官方文档作为替代来源。
5. 不要用非官方博客替代官方 API 文档，除非用户明确要求调研方案或对比资料。

特别注意：

- Mastra 相关开发必须确认当前 `@mastra/core` 的 `Agent`、`Mastra`、`createTool`、tool schema、streaming、observability API。
- Vercel AI SDK 相关开发必须确认当前 `generateObject`、streaming、model provider、structured output API。
- Next.js 相关开发必须确认当前 App Router、Route Handlers、Server Actions、metadata、dynamic rendering 规则。
- Prisma/Supabase 相关开发必须确认当前 migration、client、connection pooling 和部署环境变量要求。

## 技术栈约定

- Web 框架：Next.js App Router。
- 语言：TypeScript。
- UI：React、Tailwind CSS、shadcn/ui。
- 图标：lucide-react。
- 图表：Recharts。
- AI 调用：Vercel AI SDK。
- Agent 框架：Mastra。
- Schema 校验：Zod。
- 代码预览：Sandpack。
- 数据库：Supabase PostgreSQL。
- ORM：Prisma。
- 部署：Vercel。

职责边界：

- Mastra 负责 Agent、Tool、工具描述、工具输入输出 Schema、本地调试和可观测性。
- Vercel AI SDK 负责模型调用、结构化输出和流式响应。
- VentureFlow Runtime 负责工具白名单、最大步数、最大修复次数、AgentState 持久化和 `finish_task` 完成校验。
- Zod 负责所有 AI 输出、API 输入和关键业务对象的运行时校验。

## 开发流程

执行开发任务时遵循以下顺序：

1. 阅读相关 PRD、架构文档和模块计划。
2. 如果涉及外部 API 或文档，先使用 Context7 MCP 查询最新官方文档。
3. 明确要创建或修改的文件。
4. 优先写测试或校验用例。
5. 做最小可工作的实现。
6. 运行相关验证命令。
7. 修复失败。
8. 总结变更、验证结果和剩余风险。

不要跳过文档确认、Schema 校验、测试和完成前验证。

## 代码风格

- 使用 TypeScript strict 思路编写代码，避免隐式 `any`。
- 优先使用小而清晰的模块，避免把业务、UI、数据访问和 AI 调用混在同一个文件。
- 所有 AI 输出都必须经过 Zod Schema 校验后再进入数据库或 UI。
- API Route 中只做请求解析、权限/输入校验和服务调用，不堆业务逻辑。
- 数据访问集中放在 `src/server/**/**-repository.ts` 或明确的 service 文件中。
- React 组件保持工具型 UI 风格：紧凑、可扫描、状态清晰。
- 注释使用中文；专业术语、技术术语可保留英文。
- 不引入与当前任务无关的重构。

## Agent 编排规范

Agent 编排必须遵守有边界自治：

- 使用 `Autonomous Supervisor Agent` 作为总控。
- 专业 Agent 优先实现为 Mastra tools。
- 工具调用必须来自白名单。
- 每个工具必须有明确 `inputSchema` 和 `outputSchema`。
- 每次工具调用都要记录 tool name、arguments 摘要、result 摘要、状态、耗时和错误。
- 不保存或展示模型私有推理链，只保存简短 `reasoningSummary`。
- `MAX_AGENT_STEPS = 12`。
- `MAX_BUILD_ATTEMPTS = 2`。
- `MAX_REPAIR_ATTEMPTS = 1`。
- Agent 申请完成时必须通过 `canFinish` 和 `finish_task` 系统校验。

禁止：

- 无限工具调用。
- 无限代码修复。
- 让 Agent 自己绕过系统完成条件。
- 生成不经过 Blueprint 的应用。
- 直接执行任意用户生成的服务端代码。

## 生成应用安全边界

生成应用必须：

- 包含 `/App.tsx`。
- 在 Sandpack 中运行。
- 使用固定依赖白名单。
- 使用 localStorage 保存应用内部业务数据。
- 至少包含新增操作。
- 至少包含修改或状态变更操作。
- 支持搜索、筛选或排序中的至少一种。

生成应用禁止：

- 外部网络请求。
- 动态安装依赖。
- Node.js 服务端 API。
- 访问宿主页面 DOM。
- 任意脚本注入。
- 覆盖 VentureFlow 主应用的 localStorage key。

## 测试与验证

当前项目处于规划和初始化阶段。工程初始化后，优先使用以下命令验证：

```bash
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

按任务范围选择最小验证集：

- 类型或 Schema 改动：运行 `npm run typecheck` 和相关 Vitest。
- API 或 repository 改动：运行相关单元测试和 `npm run typecheck`。
- UI 改动：运行 `npm run typecheck`，必要时运行 Playwright。
- Sandpack/Preview 改动：运行对应单元测试、构建和浏览器验证。
- Agent 编排改动：运行 Agent、tool、contract 相关测试。

完成前必须说明实际运行过哪些命令，以及是否通过。不要声称未验证的内容已经通过。

## 数据与持久化规范

MVP 数据模型包括：

- `Project`
- `Generation`
- `GeneratedVersion`
- `AgentState`
- `UsageEvent`

约定：

- Project、Generation、GeneratedVersion、AgentState 和 UsageEvent 保存到 Supabase PostgreSQL。
- 生成应用内部业务数据使用 localStorage。
- 新版本不能覆盖旧版本。
- 失败的 Generation 也要保留错误信息，方便 Timeline 和 Debug。
- Usage Events 的 metadata 必须限制大小和字段形态。

## 安全规范

- API Key 只能存在服务端环境变量。
- 不把服务端 secrets 传给客户端组件或生成应用。
- 公开 Preview 只能读取已发布版本需要的数据。
- 用户输入需要基础长度和内容校验。
- AI 生成内容必须通过 Schema 和安全边界检查。
- 禁止使用用户输入拼接未经验证的数据库查询。

## Git 与文件操作

- 不要删除或重写用户已有文件，除非任务明确要求。
- 不要提交 `.DS_Store`、本地缓存、临时渲染产物或密钥文件。
- 每个模块完成后建议提交一个聚焦 commit。
- 提交信息使用简洁英文 Conventional Commit，例如：
  - `feat: add bounded agent supervisor`
  - `feat: add controlled ai tools`
  - `docs: add demo script`
  - `chore: configure project foundation`

## 语言规范

- 使用中文响应。
- 代码注释使用中文，专业术语和技术术语可使用英文。
- 面向用户的总结应简洁说明变更、验证和风险。

import type { DocData, DocSection } from "../data"

// ── 文档内容注册表 ────────────────────────────────────────────────
const contentMap: Record<string, Omit<DocData, "entry">> = {}

// ── 0. 产品总览 ──────────────────────────────────────────────────
contentMap["overview"] = {
  sections: [
    { id: "ventureflow-是什么", title: "VentureFlow 是什么", level: 2 },
    { id: "核心工作流", title: "核心工作流", level: 2 },
    { id: "为什么是-problem-first", title: "为什么是 Problem-first", level: 2 },
    { id: "自主管道--对话干预", title: "自主管道 + 对话干预", level: 2 },
    { id: "技术栈一览", title: "技术栈一览", level: 2 },
    { id: "生成应用能做什么", title: "生成应用能做什么", level: 2 },
    { id: "安全边界", title: "安全边界", level: 2 },
    { id: "适合谁用", title: "适合谁用", level: 2 },
    { id: "下一步", title: "下一步", level: 2 },
  ],
  content: `# VentureFlow 是什么

VentureFlow 是一个 **Problem-first AI Agent 应用**。你描述业务问题——比如"销售团队用 Excel 管客户，老忘记跟进"——它自动完成分析、设计、编码、上线、观察数据、迭代优化这一整条链路。

和你见过的其他 AI 代码工具有一个根本区别：它不让你先描述功能。大多数工具的做法是"你说要什么功能，我帮你写代码"。VentureFlow 的做法是"你先说遇到了什么问题，我帮你搞清楚到底需要什么，再动手"。

这听着像个小差异，实际上改变了整个工作方式。很多业务问题背后的"真需求"和用户一开始以为的不一样。一个说"我要个 CRM"的人，可能真正需要的是"让跟进记录不要丢在微信聊天里"。Agent 先把这个理清楚，再决定做什么。

## 核心工作流

VentureFlow 跑一条完整的闭环，不是单次问答：

1. **你输入问题**。用自然语言描述你遇到的业务困境。不用想方案，就说现在怎么做的、哪里不顺。
2. **Agent 分析问题**。它会梳理出目标用户、真实痛点、期望结果和推荐的应用模式。这一步叫 Strategy。
3. **Agent 生成产品蓝图**。基于分析结果，设计出数据实体、页面布局和核心流程。这一步叫 Blueprint——是后续代码生成的精确契约。
4. **Agent 写代码**。根据 Blueprint 生成一个能在浏览器里跑的 React 应用。不是模板填空，是完整可操作的应用。
5. **你在右侧实时预览**。Sandpack 技术让应用在浏览器内直接运行。新增一条记录、改个状态、搜个关键词——这些都即时生效。
6. **Agent 收集使用数据**。应用里每次点击、新增、修改、搜索都被记录为 Usage Event。不存具体内容，存行为模式。
7. **Agent 给出优化建议**。基于真实使用数据，告诉你"用户几乎没用搜索功能，但列表翻页特别频繁——可能需要更好的筛选"。
8. **一键生成改进版**。点了 Apply Improvement，Agent 生成新版本。旧版本保留，随时可以回看对比。

整个过程你和 Agent 是在对话中完成的——你想在哪一步说话就说，不想说就让 Agent 自己跑完。

## 为什么是 Problem-first

说一个真实的尴尬。很多内部工具的需求是这样来的：老板说"我要个数据看板"，开发问"看什么"，老板说"你先做一个"。做出来没人看，因为老板自己也不知道要看什么。

Problem-first 尝试解决的就是这个。在你还没想清楚解决方案的时候，让 Agent 先帮你把问题解剖开：谁在用、卡在哪、你希望怎么样的结果。基于这些问题倒推方案，比基于模糊的功能描述正向造车靠谱。

这不是锦上添花的设计哲学。这是产品核心差异。

## 自主管道 + 对话干预

这里有一个微妙的平衡。AI Agent 应用容易走两个极端：要么完全听指令（你说啥我做啥），要么完全自主（运行时你插不上嘴）。

VentureFlow 走中间路线：

- **默认自主**。Agent 知道自己下一步该干嘛。Strategy 出来了吗？没有→先分析。Blueprint 有了吗？没有→基于 Strategy 生成。这套流程是确定性的，不靠 LLM 猜。
- **随时对话**。Agent 每完成一个大步骤（分析完、蓝图生成、应用写完），会主动暂停一下。你可以说"继续"让它往下跑，也可以说"再加一个实体，供应商管理"让它修改蓝图。
- **结果受控**。不管 Agent 怎么跑，有几个硬约束不商量：最多执行 12 步、最多生成 2 次应用、最多修复 1 次、所有输出必须通过 Schema 校验。超了就停，数据错了就标记失败。

用简单的话说：Agent 有方向盘，但你有刹车和转向。方向盘不会开到沟里去因为路两边有护栏。

## 技术栈一览

| 层级 | 技术 |
| --- | --- |
| Web 框架 | Next.js 16 App Router |
| UI | React 19 + Tailwind CSS v4 |
| AI 调用 | Vercel AI SDK |
| Agent 编排 | Mastra |
| Schema 校验 | Zod |
| 代码预览 | Sandpack |
| 数据库 | Supabase PostgreSQL + Prisma |
| 部署 | Vercel |

选了这些不是因为它们是热点——是因为它们配合起来类型链路最完整。TypeScript → Zod → Prisma → React Props，从数据库字段到 UI 属性，整个链路里没有一个地方类型是断的。这在 AI 生成代码的场景里特别重要：LLM 输出不可靠，Zod 校验把不可靠的输出挡在数据库和 UI 外面。

## 生成应用能做什么

Agent 生成出来的应用不是一个静态页面。它是一个可操作的 React 应用：

- **数据增删改查**。新增记录、编辑字段、标记状态、删除条目。
- **搜索和筛选**。关键词搜索、列表筛选、按日期/状态排序。
- **数据持久化**。应用内部数据存在浏览器的 localStorage 里。刷新页面数据还在。
- **独立公开访问**。每个版本可以生成一个公开链接，发给同事直接试用。

但有些事它做不了——这是故意的。不能发网络请求、不能装额外的 npm 包、不能读写你的电脑文件。所有代码在一个沙箱里跑，安全边界是写死的。

## 安全边界

Agent 虽然是自主的，但权限是收束的：

- 工具调用白名单。Agent 只能调注册表里那 11 个工具，没有"执行任意代码"或"访问文件系统"这种后门。
- 步数上限。12 步跑不完就停，不会无限循环。
- 生成次数上限。一个项目最多生成 2 次、修复 1 次。不会陷入"修了又坏、坏了又修"的死循环。
- Schema 校验。每个 AI 输出在入库前先过 Zod 校验。格式不对的直接标记失败，不进数据库。
- 依赖白名单。生成的应用只能使用 react、react-dom、lucide-react、recharts 这四个包。想装 axios？不行。

总的来说：Agent 的自由在工具白名单和步数预算之内。超出这个范围的任何操作，系统层直接拦截。

## 适合谁用

三类人可能觉得有用：

1. **业务负责人**——有业务问题，没技术团队。描述问题，得到一个能跑的原型。拿去做内部试用、收集反馈、验证想法。不需要先写好 PRD。

2. **工程师**——想快速验证一个产品想法，不想从空文件夹开始搭。VentureFlow 生成的代码结构清晰，可以直接下载继续开发。而且 Blueprint 本身就是一份不错的架构文档。

3. **产品经理**——做竞品调研或需求评审时，把业务问题丢进去看 Agent 怎么分析。分析结果本身就是一个可以讨论的起点："Agent 认为痛点在这里，你觉得呢？"

目前版本是 MVP——这意味着它能跑完整条链路，但还有很多"想加但还没加"的东西。比如自定义 UI 主题、多语言、团队协作、数据库接入等等。哪些先做，取决于哪些能最快帮到实际用户。

## 下一步

建议按这个顺序浏览文档：

1. 先看这篇总览（你已经在这了）
2. [技术架构方案](/docs/technical-architecture) — 了解系统怎么搭的
3. [开发任务总览](/docs/plan) — 看到 MVP 包括哪些模块
4. 按编号顺序读开发指南 — 从基础工程到部署，每个模块的具体实现

如果你想跑起来试试，工程代码在 \`src/\` 下，\`npm run dev\` 启动本地服务。前置条件：Node.js 22+、一个 Supabase 项目、一个 OpenAI API Key。`,
}

// ── 1. 技术架构方案 ──────────────────────────────────────────────
contentMap["technical-architecture"] = {
  sections: [
    { id: "方案目标", title: "方案目标", level: 2 },
    { id: "技术选型总览", title: "技术选型总览", level: 2 },
    { id: "架构原则", title: "架构原则", level: 2 },
    { id: "problem-first", title: "Problem-first", level: 3 },
    { id: "路径自治--对话干预结果受控", title: "路径自治 + 对话干预，结果受控", level: 3 },
    { id: "浏览器内运行不执行任意后端代码", title: "浏览器内运行，不执行任意后端代码", level: 3 },
    { id: "中间产物可恢复", title: "中间产物可恢复", level: 3 },
    { id: "数据驱动迭代", title: "数据驱动迭代", level: 3 },
    { id: "系统总体架构", title: "系统总体架构", level: 2 },
    { id: "数据流与持久化策略", title: "数据流与持久化策略", level: 2 },
    { id: "安全边界", title: "安全边界", level: 2 },
    { id: "ai-output-schema", title: "AI 输出 Schema 约定", level: 3 },
    { id: "generated-app-sandbox", title: "生成应用沙箱", level: 3 },
    { id: "agent-gate", title: "Agent 门禁", level: 3 },
  ],
  content: `# 方案目标

VentureFlow MVP 的核心目标是验证一条完整的 Problem-to-Solution 闭环：

用户描述业务问题 → Agent 自主分析 → 生成 Product Blueprint → 生成可运行 React 应用 → Sandpack 在线预览 → 用户随时通过对话干预 → 采集 Usage Events → AI 生成优化建议 → 生成改进版本。

采用的交互模型：**"自主 Agent 管道 + 对话式干预"**。

- 默认行为：Agent 自主跑完整条 Strategy → Blueprint → Build → Review 管道，用户无需干预。
- 对话干预：用户可在任何阶段通过聊天消息介入——修改 Blueprint、重新生成、指定确认。
- 实时反馈：每一步产出（Strategy 卡片、Blueprint 卡片、Sandpack Preview）实时渲染在聊天流中。

## 技术选型总览

| 层级 | 技术选型 | 用途 |
| --- | --- | --- |
| Web 框架 | **Next.js App Router** | 主应用、API Routes、公开 Preview 路由 |
| 开发语言 | **TypeScript** | 前后端、Schema 类型统一链路 |
| UI | **React + Tailwind CSS + shadcn/ui** | 工作区、Timeline、表单和业务 UI |
| 图标 | **lucide-react** | 按钮、状态、工具栏图标 |
| 图表 | **Recharts** | Analytics、Dashboard、生成应用内图表 |
| AI 调用 | **Vercel AI SDK** | LLM 调用、结构化输出、流式响应 |
| Agent 编排 | **Mastra + 自定义 Supervisor** | 有边界自治 Agent、工具调用、状态推进 |
| Schema 校验 | **Zod** | 所有 AI 输出和关键业务对象的运行时校验 |
| 代码预览 | **Sandpack** | 浏览器内运行生成的 React 应用 |
| 数据库 | **Supabase PostgreSQL** | 项目、生成版本、Agent 状态、Usage Events |
| ORM | **Prisma** | 数据模型、迁移、类型化查询 |
| 部署 | **Vercel** | 主应用和公开 Preview |

## 架构原则

### Problem-first

系统不要求用户先定义应用功能，而是从业务问题出发。Agent 先生成 Strategy 分析问题域，再生成 Product Blueprint 定义解决方案，最后生成可运行的应用。

### 路径自治 + 对话干预，结果受控

Agent 默认自主决定工具调用顺序和执行路径，用户可以随时通过对话消息干预。系统必须控制：工具白名单、最大执行步数（12 步）、最大生成次数（2 次）、最大修复次数（1 次）、输出 Schema、应用能力边界、任务完成条件。

### 浏览器内运行，不执行任意后端代码

生成应用在 Sandpack 中运行。MVP 不为每个生成应用创建独立容器、后端服务或动态数据库。依赖清单是白名单控制的。

### 中间产物可恢复

Strategy、Blueprint、Build、Review、AgentState、GeneratedVersion 全部持久化到 PostgreSQL。页面刷新或模型调用失败后，用户可以恢复项目状态继续。

### 数据驱动迭代

公开 Preview 中的操作记录 Usage Events。Growth Agent 基于真实事件（或明确标识的 Demo data）生成优化建议，不凭空猜测。

## 系统总体架构

VentureFlow 分三层：

1. **Next.js 前端层**：Chat + Preview 双栏 UI、Sandpack Runner、公开预览页面。
2. **Agent Runtime 层**：Supervisor 控制循环、Mastra Agent、11 个 AI 工具、状态持久化、消息 API。
3. **数据层**：PostgreSQL（项目/版本/AgentState/UsageEvents）、本地 localStorage（生成应用内业务数据）。

## 数据流与持久化策略

用户消息通过 \`/api/projects/:id/agent/messages\` POST 到达服务端。服务端调用 Supervisor（支持 HTTP 和 SSE 两种模式），每步工具执行后更新 AgentState 到数据库，同时生成 ChatMessage。前端通过 SSE 实时接收消息推送，渲染到 Chat Panel。

Prisma 数据模型包含 6 张表：Project、Generation、GeneratedVersion、AgentState、UsageEvent、ChatMessage。AgentState 通过 "projectId" 与 Project 一对一关联。

## 安全边界

### AI 输出 Schema 校验

所有 AI 输出（Strategy、Blueprint、AgentAction、ReviewResult）必须经过 Zod Schema 校验后才可入库或进入 UI。校验失败写入错误日志并标记当前 Generation 为 FAILED。

### 生成应用沙箱

生成应用在 Sandpack 中运行，强制使用固定依赖白名单：react、react-dom、lucide-react、recharts。禁止外部网络请求、动态安装依赖、Node.js 服务端 API 和宿主页面 DOM 访问。

### Agent 门禁

MAX_AGENT_STEPS = 12，MAX_BUILD_ATTEMPTS = 2，MAX_REPAIR_ATTEMPTS = 1。超过预算自动终止。工具调用必须来自白名单，不保存模型私有推理链。`,
}

// ── 2. 开发任务总览 ──────────────────────────────────────────────
contentMap["plan"] = {
  sections: [
    { id: "执行顺序", title: "执行顺序", level: 2 },
    { id: "模块依赖", title: "模块依赖", level: 2 },
    { id: "统一约定", title: "统一约定", level: 2 },
    { id: "p0-完成定义", title: "P0 完成定义", level: 2 },
  ],
  content: `# 执行顺序

VentureFlow MVP 按 9 个模块拆分，依次推进：

1. 基础工程与开发规范
2. 数据模型与持久化
3. 类型契约与 Schema
4. Agent 编排与对话式 Supervisor
5. AI 工具与应用生成
6. Chat UI + Preview 双栏界面
7. Sandpack Preview 与公开预览
8. Usage Analytics 与自动迭代
9. 部署、可观测性与 Demo 验收

## 模块依赖

基础工程（01）是所有模块的前置。数据模型（02）和类型契约（03）可并行。Agent 编排（04）依赖 02 和 03。AI 工具（05）依赖 04。Chat UI（06）依赖 05。Preview（07）依赖 06。Analytics（08）依赖 07。部署（09）依赖所有模块。

## 统一约定

- 开发语言使用 TypeScript strict 思路，避免隐式 \`any\`。
- 主应用使用 Next.js App Router，API Routes 只做请求解析和参数校验。
- 数据访问使用 Prisma + Supabase PostgreSQL，repository 层集中管理。
- AI 调用统一通过 Vercel AI SDK，封装模型调用、结构化输出和流式响应。
- Schema 校验使用 Zod，所有 AI 输出入库前必须校验。
- 前端 Chat + Preview 双栏布局，Chat Panel 通过 Message API 与 Agent 通信。
- 生成应用只在 Sandpack 中运行，不执行任意后端代码。

## P0 完成定义

- 用户在一页上通过对话创建项目并描述业务问题。
- Agent 自主执行 Strategy → Blueprint → Build 管道，每一步产出实时渲染。
- 用户可随时通过聊天消息干预。
- 生成应用在 Sandpack 中运行，支持 CRUD 和 localStorage。
- 公开 Preview 可访问并记录 Usage Events。
- Growth Agent 可基于事件生成优化建议。
- Apply Improvement 可生成新版本并保留旧版本。`,
}

// ── 3-13: 为每个开发指南模块生成精炼内容 ──────────────────────────

const moduleContents: Record<string, { sections: DocSection[]; content: string }> = {
  "01-foundation": {
    sections: [
      { id: "目标", title: "目标", level: 2 },
      { id: "工程初始化", title: "工程初始化", level: 2 },
      { id: "tailwind-主题配置", title: "Tailwind 主题配置", level: 2 },
      { id: "环境变量校验", title: "环境变量校验", level: 2 },
      { id: "全局布局", title: "全局布局", level: 2 },
      { id: "关键文件", title: "关键文件", level: 2 },
    ],
    content: `# 目标

搭建 VentureFlow 的基础工程骨架：Next.js App Router + TypeScript + Tailwind CSS + 基础配置。为后续所有模块提供一致的开发环境。

## 工程初始化

使用 Next.js 16 App Router 创建项目，配置 TypeScript strict 模式。安装 Tailwind CSS v4 和 shadcn/ui 作为 UI 基础。ESLint 使用 Next.js 推荐配置，Prettier 统一代码风格。

核心依赖：\`next\`、\`react\`、\`react-dom\`、\`typescript\`。

## Tailwind 主题配置

在 \`globals.css\` 中定义 VentureFlow 完整的设计 Token：

- \`--color-page: #f7f4ed\` — 奶油纸底色
- \`--color-ink: #1c1c1c\` — 主文字色
- \`--color-gold: #C88D2B\` — 品牌金
- \`--color-border: #eceae4\` — 被动分割线
- \`--color-border-interactive: rgba(28,28,28,0.4)\` — 交互边框
- \`--shadow-button-inset\` — 深色按钮多层内阴影
- \`--shadow-button-gold-inset\` — 金色按钮内阴影

字体使用 Camera Plain Variable 作为主字体，JetBrains Mono 作为代码字体。

## 环境变量校验

在服务端入口校验必需的环境变量（\`DATABASE_URL\`、\`DIRECT_URL\`、\`GEMINI_API_KEY\` 等），缺少时给出明确错误信息而非静默失败。使用 Zod schema 规范化环境变量读取。

## 全局布局

根布局 \`layout.tsx\` 设置：HTML lang="zh-CN"、奶油底色、全局字体、viewport meta。嵌套 layout 按需提供特定页面的共享布局（如 Workspace 双栏）。

## 关键文件

- \`src/app/globals.css\` — 全局样式和设计 Token
- \`src/app/layout.tsx\` — 根布局
- \`src/env.ts\` — 环境变量校验
- \`next.config.ts\` — 框架配置
- \`tailwind.config.ts\` — Tailwind 扩展配置
- \`eslint.config.mjs\` — 代码规范`,
  },

  "02-data-model": {
    sections: [
      { id: "数据模型设计", title: "数据模型设计", level: 2 },
      { id: "prisma-schema", title: "Prisma Schema", level: 2 },
      { id: "迁移策略", title: "迁移策略", level: 2 },
      { id: "repository-层", title: "Repository 层", level: 2 },
    ],
    content: `# 数据模型设计

VentureFlow MVP 的核心数据包括 6 张表：Project、Generation、GeneratedVersion、AgentState、UsageEvent、ChatMessage。所有表通过 Supabase PostgreSQL 持久化。

## Prisma Schema

**Project**：项目主表。包含 originalProblem、status（DRAFT/RUNNING/NEEDS_REVIEW/COMPLETED/FAILED）、JSON 字段存储 strategy 和 blueprint、关联当前版本。

**Generation**：每次 AI 生成记录。记录 type（STRATEGY/BLUEPRINT/BUILD/REVIEW/OPTIMIZATION）、input/output（JSON）、status 和错误信息。

**GeneratedVersion**：版本快照。files 字段存储生成应用的全部源码，blueprintSnapshot 记录生成时的 Blueprint 快照，publishStatus 控制公开预览。

**AgentState**：Agent 运行时状态。与 Project 一对一关联，记录 currentPlan、toolCalls 历史、buildAttempts、repairAttempts、totalTokens 等。

**UsageEvent**：公开预览中的用户操作事件。记录 eventName、entityName、metadata（JSON）。

**ChatMessage**：对话消息。记录 role（user/agent/system）、type（消息卡片类型）、content（Markdown 文本）、metadata（JSON 结构化数据）。

## 迁移策略

使用 \`prisma migrate dev\` 生成迁移文件。当前包含 3 次迁移：
1. \`init\` — 初始表结构
2. \`expand_agent_state\` — 扩展 AgentState 字段
3. \`add_agent_optimization_and_chat_messages\` — 新增 ChatMessage 和优化支持

每次迁移前验证 Schema 变更不对现有数据造成破坏性影响。

## Repository 层

所有数据访问通过 Repository 函数封装，不直接在 API Route 中操作 Prisma Client。每个 Repository 文件对应一张表，导出明确的类型化函数（如 \`getAgentState\`、\`saveAgentState\`、\`getChatMessages\`）。`,
  },

  "03-contracts-and-schemas": {
    sections: [
      { id: "设计原则", title: "设计原则", level: 2 },
      { id: "核心-schema", title: "核心 Schema", level: 2 },
      { id: "strategy-schema", title: "Strategy Schema", level: 3 },
      { id: "blueprint-schema", title: "Blueprint Schema", level: 3 },
      { id: "agent-action-schema", title: "Agent Action Schema", level: 3 },
      { id: "测试策略", title: "测试策略", level: 2 },
    ],
    content: `# 设计原则

所有 AI 输出、API 输入和关键业务对象都必须经过 Zod Schema 校验。校验失败不能静默——要么抛出明确错误、要么标记 Generation 为 FAILED。

Schema 定义集中在 \`src/server/contracts/\` 目录，按领域拆分文件。每个 Schema 文件同时导出 TypeScript 类型（通过 \`z.infer\`）。

## 核心 Schema

### Strategy Schema

Strategy 是 Agent 分析用户业务问题后生成的结构化报告，包含：

- \`problemSummary\` — 问题一句话概括
- \`targetUsers\` — 目标用户群体
- \`painPoints\` — 痛点列表
- \`desiredOutcomes\` — 期望结果
- \`recommendedAppPattern\` — 推荐的应用模式（如 CRM、内容管理、反馈面板）
- \`validationQuestions\` — 需要用户确认的关键假设

Schema 限制数组长度和字符串长度，防止 Agent 生成过于冗长的输出。

### Blueprint Schema

Blueprint 是应用生成的精确契约：

- \`appPattern\` — 应用类型模式
- \`entities\` — 数据实体定义（含字段、类型、关系）
- \`pages\` — 页面规划（含名称、用途、布局描述）
- \`workflows\` — 核心业务流程
- \`productDecisions\` — 产品设计的关键取舍

每个 Entity 的 fields 数组定义了字段名、类型（string/number/boolean/date/enum）、是否必填。Pages 的 layout 字段描述页面组件结构。

### Agent Action Schema

Agent 决策输出的联合类型，使用 \`z.discriminatedUnion("type")\`：

- \`{ type: "tool", toolName, arguments, reasoningSummary }\` — 调用工具
- \`{ type: "finish", reasoningSummary }\` — 请求完成

ToolName 为联合字面量类型，涵盖全部 11 个工具。arguments 为 \`z.record(z.unknown())\`，具体校验由工具注册表在调用时完成。

## 测试策略

每个 Schema 文件都有对应的 \`.test.ts\` 文件，覆盖有效输入、边界情况和非法输入。测试使用 Vitest，共计 10 个 Schema 测试文件，155 个测试用例全部通过。`,
  },

  "04-agent-orchestration": {
    sections: [
      { id: "设计思路", title: "设计思路", level: 2 },
      { id: "supervisor-架构", title: "Supervisor 架构", level: 2 },
      { id: "用户意图解析", title: "用户意图解析", level: 2 },
      { id: "流式推送", title: "流式推送 (SSE)", level: 2 },
      { id: "消息卡片生成", title: "消息卡片生成", level: 2 },
    ],
    content: `# 设计思路

Agent 编排采用"自主管道 + 对话干预"混合模式。核心设计原则：对话是用户的主入口，Agent 自主管道是默认行为——两者不矛盾。Agent 每步执行完发一条消息到聊天流，用户可选择沉默（Agent 继续）或发言（Agent 响应干预）。

## Supervisor 架构

\`supervisor.ts\` 是核心文件（1100+ 行），实现三个关键函数：

- \`handleUserMessage\` — HTTP 响应式入口。接收用户消息，判断当前状态：如果在 waiting_for_user 则走干预处理，否则启动自主管道。
- \`handleUserMessageStream\` — SSE 流式入口。每步推送 thinking/state/result 事件，前端实时渲染进度。
- \`runAgentTurn\` / \`runAgentTurnStream\` — 自主管道单轮执行。按 Strategy → Capabilities → Blueprint → Validate → Build → Review → Repair 顺序推进。

管道使用 \`createPipelineAction\` 函数决定下一步：检查当前 AgentState 缺失什么产物，按顺序填充。这不是 LLM 决策，而是确定性的业务逻辑——只在干预修改时才调用 LLM 做意图解析。

## 用户意图解析

\`user-intent.ts\` 定义了 7 种用户意图类型（通过 Zod discriminatedUnion）：

- **continue** — 继续执行
- **modify_blueprint** — 修改 Blueprint
- **redo_blueprint** — 重做 Blueprint
- **regenerate_page** — 重新生成特定页面
- **skip_to_build** — 跳过当前步骤
- **accept** — 确认完成
- **repair_application** — 根据报错信息修复
- **unknown** — 无法识别时返回澄清问题

意图解析通过 LLM 调用完成（\`generateObject\`），使用专门的意图解析指令。

## 流式推送 (SSE)

\`handleUserMessageStream\` 通过 ReadableStream 推送 SSE 事件。事件类型：

- \`thinking\` — 工具即将执行，携带 toolName 和计划进度
- \`state\` — AgentState 变更，用于更新 UI 状态栏
- \`result\` — 工具执行完毕，携带消息卡片数据
- \`done\` — 本轮执行结束，携带最终状态
- \`error\` — 执行出错

前端通过 \`EventSource\` 或 fetch + ReadableStream 消费 SSE。

## 消息卡片生成

\`buildAgentMessage\` 根据工具名和 AgentState 生成不同格式的消息卡片：

- \`analyze_problem\` → Strategy 卡片（问题概述、用户、痛点、推荐模式）
- \`create_blueprint\` → Blueprint 卡片（实体列表、页面规划、核心流程）
- \`generate_application\` → Build 卡片（文件列表、预览链接）
- \`inspect_build\` → Review 卡片（通过/发现问题的格式化输出）
- \`inspect_capabilities\` / \`validate_blueprint\` → 不生成独立卡片，仅更新进度条`,
  },

  "05-ai-tools-and-generation": {
    sections: [
      { id: "工具注册表", title: "工具注册表", level: 2 },
      { id: "llm-生成工具", title: "LLM 生成工具", level: 2 },
      { id: "本地校验工具", title: "本地校验工具", level: 2 },
      { id: "增量修改工具", title: "增量修改工具", level: 2 },
      { id: "优化与完成工具", title: "优化与完成工具", level: 2 },
    ],
    content: `# 工具注册表

\`tool-registry.ts\` 是工具的中枢注册表。每个工具实现 \`AgentTool\` 接口：\`name\`、\`execute(args, state) → AgentToolResult\`。注册表提供 \`get(name)\` 和 \`getAll()\` 方法，Supervisor 通过注册表查找和执行工具。

共实现 11 个工具，分为三类。

## LLM 生成工具

这些工具调用 LLM 生成结构化内容，输出必须通过 Zod 校验：

- **analyze_problem**：分析用户输入的业务问题。通过 \`generateObject\` 调用 LLM，使用 Strategy Schema 校验输出。失败时返回部分结果并标记。

- **create_blueprint**：基于 Strategy 生成 Product Blueprint。prompt 包含 Blueprint Schema 的完整 JSON 描述，指导 LLM 生成合规输出。支持实体数量上限（≤ 8 个）、页面数量上限（≤ 6 个）。

- **generate_application**：基于 Blueprint 生成 React 应用源码。输出 \`{ files: Array<{ path: string, content: string }> }\`。强制要求生成 \`/App.tsx\` 作为入口。依赖限定为白名单。

- **modify_blueprint**：基于用户反馈增量修改 Blueprint，保留未涉及的部分。

- **regenerate_page**：重新生成指定页面的代码，保留其他文件和 Blueprint 不变。

- **repair_application**：根据 Review 报告中发现的问题修复应用代码。

- **optimize_product**：基于 Usage Events 数据生成产品优化建议。

## 本地校验工具

不调用 LLM，纯业务逻辑校验：

- **inspect_capabilities**：返回当前平台能力边界列表（支持的 UI 组件、数据操作、存储方式）。帮助 LLM 了解可用的构建块。

- **validate_blueprint**：校验 Blueprint 是否在页面数、实体数、功能数等维度落在能力边界内。超出边界时返回警告。

- **inspect_build**：检查生成应用的入口文件（/App.tsx 是否存在）、安全边界（无外部请求、无 eval）、基础功能完整性。

## 增量修改工具

修改工具的设计原则是保留用户已满意的部分，只修改指令指向的目标。例如 \`modify_blueprint\` 接收完整的现有 Blueprint + 修改指令，LLM 返回修改后的完整 Blueprint，其他字段保持不变。

## 优化与完成工具

- **finish_task**：由 Supervisor 在执行预算用尽时自动调用，标记 Agent 状态。`,
  },

  "06-workspace-ui": {
    sections: [
      { id: "双栏布局", title: "双栏布局", level: 2 },
      { id: "chatpanel", title: "ChatPanel 对话面板", level: 2 },
      { id: "消息卡片系统", title: "消息卡片系统", level: 2 },
      { id: "智能输入区", title: "智能输入区", level: 2 },
      { id: "agent-进度条", title: "Agent 进度条", level: 2 },
    ],
    content: `# 双栏布局

Workspace 页面采用 Chat + Preview 双栏布局：左侧对话面板，右侧 Sandpack 实时预览。布局使用 CSS Grid 实现，桌面端 1:1 分栏，移动端切换为上下排列。

## ChatPanel 对话面板

ChatPanel 是对话式交互的核心容器。通过 SSE 连接服务端 Agent，实时渲染消息流。关键交互：

- 首次进入时显示欢迎卡片，引导用户描述业务问题
- 消息流自动滚动到底部（新消息到达时）
- 显示 typing 动画指示 Agent 正在思考
- 支持消息卡片的内联操作（展开/收起详情）

消息流通过 \`useChatMessages\` hook 管理，从服务端拉取历史消息并通过 SSE 追加新消息。

## 消息卡片系统

ChatMessage 组件根据消息类型渲染不同的卡片样式，共 8 种类型：

- **user-text**：用户文本消息，右对齐气泡
- **agent-strategy**：Strategy 分析结果卡片，包含问题概述、痛点、推荐模式
- **agent-blueprint**：Blueprint 产品蓝图卡片，展示实体和页面列表
- **agent-build**：Build 结果卡片，显示生成的文件列表
- **agent-review**：Review 审查结果卡片，通过/问题两种样式
- **agent-question**：Agent 向用户提问的引导卡片
- **agent-thinking**：Agent 思考中指示器
- **agent-error**：错误信息卡片

每种卡片类型有不同的视觉区分：Strategy 卡片顶部有金色细线，Blueprint 卡片有实体徽章，Review 未通过时显示红色边框。

## 智能输入区

ChatInput 组件提供文本输入 + 快捷操作建议。支持：

- 多行输入，自动调整高度
- Enter 发送，Shift+Enter 换行
- 打字机效果的建议提示（useTypewriterPlaceholder）
- 发送按钮带金色品牌样式

## Agent 进度条

AgentProgressBar 显示当前 Agent 执行进度。6 个步骤（分析→检查→蓝图→校验→生成→审查），每个步骤有 running/completed/failed 三种状态。完成步骤用金色圆点标记，当前步骤有脉冲动画。`,
  },

  "07-preview-runtime": {
    sections: [
      { id: "sandpack-集成", title: "Sandpack 集成", level: 2 },
      { id: "文件规范化", title: "文件规范化", level: 2 },
      { id: "公开预览", title: "公开预览", level: 2 },
      { id: "事件追踪", title: "事件追踪", level: 2 },
    ],
    content: `# Sandpack 集成

SandpackRunner 组件封装了 \`@codesandbox/sandpack-react\`，负责在浏览器中运行和预览 Agent 生成的 React 应用。

组件接收 \`files: Record<string, string>\`，内部转换为 Sandpack 的 file structure 格式。使用 SandpackProvider + SandpackLayout + SandpackPreview 组合，仅显示预览面板（不显示代码编辑器）。

需要 normalize 文件路径：确保所有路径以 \`/\` 开头、\`/App.tsx\` 作为入口文件、package.json 包含白名单依赖。

## 文件规范化

\`normalize-files.ts\` 对 Agent 生成的代码文件做规范化处理：

- 移除 AI 可能添加的 markdown 包装（\`\`\`jsx\` 标记等）
- 确保文件路径统一格式
- 检查并修复 import 语句（仅允许白名单内的依赖）
- 为缺少 export default 的组件添加默认导出

## 公开预览

\`PublicPreviewShell\` 提供生成应用的公开访问页面。路由 \`/preview/:projectId/:versionId\` 无需认证即可访问。

页面从数据库加载指定版本的 files，通过 SandpackRunner 渲染。页面底部注入 UsageEventsTracker 脚本，记录用户操作事件并通过 \`/api/events\` 上报。

## 事件追踪

UsageEventsTracker 是一个注入生成应用的小型 JS 脚本。它拦截 DOM 事件（click、change、submit），识别可追踪的交互（按钮点击、表单提交、列表操作），将事件数据 POST 到服务端 events API。

事件的 metadata 限制大小（≤ 2KB），只记录操作类型、目标元素标识和时间戳，不收集用户输入的具体值。`,
  },

  "08-analytics-growth-iteration": {
    sections: [
      { id: "事件采集", title: "事件采集", level: 2 },
      { id: "指标聚合", title: "指标聚合", level: 2 },
      { id: "growth-agent", title: "Growth Agent", level: 2 },
      { id: "apply-improvement", title: "Apply Improvement", level: 2 },
    ],
    content: `# 事件采集

Usage Event 通过两个渠道采集：
1. 公开 Preview 页面注入的 UsageEventsTracker 脚本，记录用户的按钮点击、表单提交等操作。
2. 生成应用内部的 localStorage 变更事件（新增/修改/删除实体记录）。

每个事件包含：\`eventName\`（如 \`entity_created\`、\`search_performed\`）、\`entityName\`（操作的实体类型）、\`metadata\`（JSON，限制 ≤ 2KB）。

## 指标聚合

Analytics Panel 调用 \`analytics-service.ts\` 聚合使用数据，生成以下指标：

- **活跃用户数**：在选定时间窗口内产生事件的独立 session 数
- **操作总数**：事件总量
- **操作分布**：按 eventName 分类的饼图数据
- **实体热度**：按 entityName 统计的操作频次排名
- **时间趋势**：按小时/天聚合的操作量折线图

数据通过 API Route \`/api/projects/:id/analytics\` 获取，前端使用 Recharts 渲染图表。图表配色使用 VentureFlow 设计 Token。

## Growth Agent

Growth Agent 基于 Usage Events 分析结果生成产品优化建议。它调用 \`optimize_product\` 工具，接收：

- 聚合后的使用指标
- 生成应用的 Blueprint
- 用户原始业务目标

输出优化建议列表，每条包含：\`title\`、\`description\`、\`rationale\`（基于数据的理由）、\`confidence\`（LLM 置信度）。数据不足时明确提示"数据不足以支持该建议"。

## Apply Improvement

用户点击 Apply Improvement 后，系统创建新的 Generation（type=IMPROVEMENT），调用 \`generate_application\` 生成新版本代码。新版本不覆盖旧版本——两者都保存在数据库，通过版本号（version: N+1）区分。CurrentVersionId 更新为新版本，前端 Preview 切换为新版本。`,
  },

  "09-deploy-observability-demo": {
    sections: [
      { id: "vercel-配置", title: "Vercel 配置", level: 2 },
      { id: "系统日志", title: "系统日志", level: 2 },
      { id: "demo-数据", title: "Demo 数据", level: 2 },
    ],
    content: `# Vercel 配置

\`vercel.json\` 配置：

\`\`\`json
{
  "framework": "nextjs",
  "regions": ["hkg1"]
}
\`\`\`

使用香港区域（hkg1）部署，延迟最低。Next.js 框架自动检测，无需额外构建配置。

## 系统日志

\`writeSystemLog\` 函数封装系统日志输出：

- 记录 level（info/warn/error）、eventName、projectId、generationId、message、metadata
- 格式化为 JSON 单行输出到 stdout
- 生产环境由 Vercel Logs 收集

关键节点必须记录日志：Agent Step 开始/结束、工具调用成功/失败、AI 输出 Schema 校验通过/失败、Usage Event 写入。

## Demo 数据

三类 Demo 输入涵盖不同业务场景：

1. **销售管理**（CRM 模式）：销售团队用 Excel 管理客户和线索，经常忘记跟进，负责人无法快速查看进度。
2. **客户反馈**（Feedback Board）：客户反馈分散在邮件、群聊和客服系统，无法判断哪些需求最重要。
3. **内容运营**（Content Planner）：内容团队缺少统一的排期和状态管理，内容经常延期。

每个 Demo 输入包含具体的业务场景描述和预期的应用模式，用于演示和验收测试。`,
  },

  "acceptance-checklist": {
    sections: [
      { id: "p0-链路", title: "P0 链路", level: 2 },
    ],
    content: `# P0 链路

MVP 验收的核心条件——每一项都必须通过：

- 首页可以输入至少 20 个字符的业务问题。
- 创建项目后可以进入 Workspace。
- Agent Timeline 可以展示运行状态。
- Strategy 输出包含 Facts、Assumptions、Validation Questions 和 Success Metrics。
- Blueprint 通过 Zod 校验。
- Build 输出包含 /App.tsx。
- Preview 可以运行生成应用。
- 生成应用至少支持新增操作。
- 生成应用至少支持修改或状态变更操作。
- 生成应用支持搜索、筛选或排序中的至少一种。
- 生成应用使用 localStorage 持久化。
- 公开 Preview 可以匿名访问。
- 公开 Preview 操作可以写入 Usage Events。
- Analytics 至少展示 3 个统计指标。
- Growth Agent 的建议引用真实事件数据或明确提示数据不足。
- Apply Improvement 生成新版本，旧版本保留。`,
  },

  "demo-script": {
    sections: [
      { id: "主线案例", title: "主线案例：销售管理", level: 2 },
    ],
    content: `# 主线案例：销售管理

按以下步骤演示 VentureFlow 完整流程：

1. 打开首页，看到打字机效果的问题提示。
2. 输入："我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。"
3. 点击创建项目，进入 Workspace。
4. 看到 Agent Timeline 动态推进——分析问题、检查能力、生成蓝图……
5. Agent 暂停，展示 Strategy 卡片：问题分析、目标用户、痛点、推荐 CRM 模式。
6. 用户说"继续"，Agent 生成 Blueprint：客户、线索、跟进记录三个实体，仪表盘、线索列表、客户详情等页面。
7. Agent 生成应用，右侧 Preview 面板实时渲染。
8. 在 Preview 中新增一条销售线索（公司名、联系人、状态）。
9. 修改线索状态从"新线索"到"已联系"。
10. 使用搜索功能查找特定公司。
11. 打开 Analytics 面板，查看 Usage Events 聚合指标（操作量、活跃用户、实体热度）。
12. 运行 Growth Agent，查看基于数据的优化建议（如"线索列表缺少排序功能"）。
13. 点击 Apply Improvement，Agent 生成 Version 2，保留 Version 1。`,
  },
}

// 将 01-09 的 key 映射到 contentMap
for (const [key, value] of Object.entries(moduleContents)) {
  contentMap[key] = value
}

export function getDocContent(slug: string): Omit<DocData, "entry"> | null {
  return contentMap[slug] ?? null
}

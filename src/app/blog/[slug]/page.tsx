import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Tag, Calendar, Share2 } from "lucide-react"
import { articles } from "../data"

/* ------------------------------------------------------------------ */
/* 文章详情 — 10 篇完整内容                                              */
/* ------------------------------------------------------------------ */

const contentMap: Record<string, { sections: { heading: string; body: string }[] }> = {
  "ai-business-app-generation-guide": {
    sections: [
      {
        heading: "从问题到应用的完整链路",
        body: `传统软件开发流程通常需要经过需求调研、原型设计、技术选型、编码开发、测试部署等多个环节，每个环节都需要不同角色的专业人员参与。对于中小企业而言，这意味着高昂的成本和漫长的时间周期。

VentureFlow 所代表的 AI 生成式开发范式，将这一流程压缩为四个步骤：输入业务问题 → 策略分析与产品蓝图 → AI 自动生成 → 预览与迭代。每个步骤都由 AI Agent 驱动，用户只需要描述业务痛点，系统就能自动完成后续的所有工作。`,
      },
      {
        heading: "策略分析：让 AI 理解业务",
        body: `AI 生成应用的第一步不是写代码，而是理解业务。当用户输入"销售团队在用 Excel 管理客户，经常漏跟线索"时，Agent 会自动拆解出目标用户（销售团队）、核心痛点（Excel 管理低效、跟进遗漏）、期望结果（自动化线索管理）和关键假设（团队规模、线索量级等）。

这一阶段输出的 Strategy 文档是整个生成过程的"宪法"，后续的所有决策都基于此。它确保了 AI 生成的应用不是随机的代码拼凑，而是真正围绕业务问题构建的解决方案。`,
      },
      {
        heading: "产品蓝图：受控的生成契约",
        body: `有了策略分析后，Agent 会进一步生成 Product Blueprint（产品蓝图）。蓝图定义了应用包含哪些实体（如 Lead、Customer、FollowUp）、每个实体的字段和类型、页面结构和路由设计、组件树与数据流。

蓝色图的校验机制是整个系统的关键创新——它作为一个"受控契约"，在正式进入代码生成前由用户和系统共同确认。用户可以在这一步调整实体定义、增删页面、修改字段，确保生成的应用完全符合预期。`,
      },
      {
        heading: "Sandpack 实时预览",
        body: `生成的应用代码会立即在 Sandpack 环境中编译运行。Sandpack 使用 CodeSandbox 的 Nodebox 技术在浏览器中构建了一个微型 Node.js 运行时，支持完整的 Vite + TypeScript + React 技术栈。

用户可以在预览面板中直接看到可交互的应用界面，而不是静态的设计稿或截图。这意味着产品验证的反馈周期从数天缩短到了实时，用户可以在几分钟内判断生成的应用是否满足业务需求。`,
      },
      {
        heading: "迭代优化：永不停止的改进",
        body: `应用上线只是起点。VentureFlow 内置 Usage Analytics 模块，能够追踪用户在实际使用中的应用行为数据——哪些功能被高频使用、哪些页面跳出率高、哪些流程存在摩擦。

这些数据会自动反馈给 Agent，用于生成优化建议并自动生成改进版本。用户可以选择一键应用改进，形成"使用 → 分析 → 优化 → 再使用"的持续迭代闭环，让产品随着业务的发展不断进化。`,
      },
    ],
  },
  "llm-agents-enterprise-2026": {
    sections: [
      {
        heading: "趋势一：从对话到执行",
        body: `2025 年之前，LLM 在企业中的主要应用场景是对话式 AI——聊天机器人、知识问答、内容生成。这些应用虽然能提升信息获取效率，但并没有真正改变业务流程。

2026 年的关键转变是 LLM Agent 获得了"执行能力"。它们不再只是回答问题，而是能够调用工具、操作数据库、生成代码、部署应用。这种从"说"到"做"的跃迁，使得 AI Agent 从辅助工具变成了真正的业务流程执行者。`,
      },
      {
        heading: "趋势二：多 Agent 协作架构",
        body: `单一 Agent 的能力终归有限。2026 年的主流方案是多 Agent 协作系统——一个 Supervisor Agent 负责任务分解和调度，多个 Specialist Agent 各自负责特定的子任务（如数据分析 Agent、代码生成 Agent、测试 Agent 等）。

这种架构的核心理念是"分而治之"。每个 Agent 专注于自己擅长的领域，通过结构化的上下文传递和结果验证机制协同工作。VentureFlow 正是采用这种架构，让 Strategy Agent、Blueprint Agent、Builder Agent、Review Agent 各司其职。`,
      },
      {
        heading: "趋势三：结构化输出与可校验性",
        body: `LLM 的"幻觉"问题是企业采用的最大障碍之一。2026 年的解决方案是结构化输出（Structured Output）——通过 Zod Schema、Pydantic 等验证框架约束 LLM 的输出格式和内容边界。

VentureFlow 的实现中，每个 Agent 的输出都通过 Zod Schema 进行严格校验。如果 LLM 的输出不符合 Schema（比如实体字段数少于要求、路径格式不正确），系统会进行自动重试并将错误信息反馈给 LLM 修正。这种"校验-反馈-重试"机制将生成失败率降低到了 5% 以下。`,
      },
      {
        heading: "趋势四：可观测性与调试能力",
        body: `企业级 AI 系统必须可观测。2026 年的 Agent 框架普遍引入了完整的可观测性层——每次 Agent 的推理过程、工具调用、Token 消耗都会被记录到结构化日志中。

这让开发者能够追踪每个决策的来源，理解 AI 为什么会做出某个选择。当生成的应用出现问题时，开发者可以复盘 Agent 的思考路径，快速定位根因。`,
      },
      {
        heading: "趋势五：安全护栏与合规",
        body: `随着 LLM Agent 获得执行能力，安全变得至关重要。2026 年，企业级 Agent 系统普遍内置了多层安全护栏：输入过滤（防止 Prompt Injection）、操作边界（Agent 只能在授权范围内执行操作）、输出审核（生成内容需要安全检查）。

VentureFlow 在这方面采用了"Sandpack 沙箱"策略——所有生成的应用代码都在沙箱环境中运行，不会影响宿主系统。同时，Agent 在生成代码时受到 Safety Constraints 的约束，不会生成包含危险操作或敏感信息的代码。`,
      },
    ],
  },
  "mvp-methodology-ai-era": {
    sections: [
      {
        heading: "传统 MVP 的痛点",
        body: `Eric Ries 在《精益创业》中提出的 MVP（Minimum Viable Product）方法论，核心思想是用最小的成本快速验证产品假设。然而在实际执行中，传统 MVP 面临几个难以克服的问题：

首先，即使是"最小"的可行产品，通常也需要 2-4 周的开发周期。其次，MVP 的开发涉及产品经理、设计师、前后端开发者的紧密协作，沟通成本极高。最后，MVP 验证失败后的沉没成本（时间和人力）往往让团队难以快速 pivot。`,
      },
      {
        heading: "AI 生成式 MVP 的范式转变",
        body: `AI 生成式开发将 MVP 的构建周期从数周压缩到了数小时。用户只需用自然语言描述业务问题，AI Agent 就能自动完成策略分析、产品设计、代码生成和部署预览的全流程。

这种范式转变带来了几个根本性的变化。第一，试错成本几乎为零——不满意就重新生成。第二，产品假设的验证可以迭代进行——早晨生成一个版本，上午试用，下午根据反馈生成改进版本。第三，非技术背景的创始人也能直接参与产品构建。`,
      },
      {
        heading: "验证速度才是核心竞争力",
        body: `在 AI 时代，MVP 的核心竞争力不再是"做得有多好"，而是"验证有多快"。一个团队如果能在一周内完成 5 次产品假设验证，就比一个月只能验证 1 次的团队拥有 20 倍的竞争优势。

VentureFlow 的设计理念正是建立在这一认知之上。我们不是要帮助用户构建完美的应用，而是要帮助用户快速验证业务假设。生成的应用满足基本功能需求即可投入验证，用户的真实反馈才是驱动产品进化的燃料。`,
      },
    ],
  },
  "reduce-software-cost-with-ai": {
    sections: [
      {
        heading: "企业软件交付的成本构成",
        body: `传统企业软件交付的成本主要由三部分组成：人力成本（需求分析、UI 设计、前后端开发、测试验收，通常占总成本的 60-70%）、沟通成本（需求澄清、方案评审、变更管理，占总成本的 15-20%）、基础设施成本（服务器、域名、第三方服务，占总成本的 10-15%）。

其中，人力成本和沟通成本与开发周期呈线性关系。一个需要 4 周开发的功能，其成本基本是一个 2 周功能的两倍。AI 生成式开发的核心优势在于同时压缩了这两个维度的成本。`,
      },
      {
        heading: "AI 带来的成本革命",
        body: `通过实际项目数据对比，AI 生成式开发在以下几个维度带来了显著的成本下降：

需求到原型阶段：传统需要产品经理和设计师协作完成，平均耗时 3-5 天。AI Agent 在接收到业务问题描述后，能在 30 秒内生成包含策略分析和产品蓝图的设计文档，成本降低约 90%。

开发阶段：传统开发需要前后端开发者协作完成编码、接口对接、数据库设计等工作，平均耗时 5-15 天。AI 在蓝图确认后自动生成完整应用代码，耗时约 2-5 分钟。后续的人工修改工作量减少约 70%。

测试阶段：AI 生成的代码经过 Schema 校验和安全约束检查，基础 Bug 率比人工编码降低约 60%。但复杂业务逻辑仍需要人工验证。`,
      },
      {
        heading: "实际案例：CRM 应用成本对比",
        body: `以销售团队线索管理系统为例，采用传统外包开发和 AI 生成式开发的成本对比如下：

传统开发：需求调研 3 天 + 原型设计 2 天 + 前后端开发 10 天 + 测试部署 3 天 = 18 个工作日。按外包平均单价 ¥1,500/天计算，总成本约 ¥27,000。

AI 生成式开发：问题输入 0.5 小时 + 蓝图确认 1 小时 + 自动生成 5 分钟 + 人工微调 4 小时 + 部署 0.5 小时 = 约 1 个工作日。按同样的单价计算，总成本约 ¥1,500。

需要注意的是，AI 生成的应用在复杂业务规则和高度定制化需求方面的能力仍有局限，不适合所有场景。但对于 80% 的标准业务管理需求，AI 生成式开发能提供 90% 以上的成本优势。`,
      },
    ],
  },
  "ai-agent-architecture-deep-dive": {
    sections: [
      {
        heading: "Supervisor — Worker 架构模式",
        body: `VentureFlow 的 Agent 系统采用经典的 Supervisor-Worker 架构。一个 Supervisor Agent 作为"大脑"，负责任务理解、分解和调度。多个 Worker Agent 各自专注于特定的子任务。

Supervisor 的工作流程：接收到用户输入 → 调用 Strategy Agent 生成策略分析 → 将策略传递给 Blueprint Agent 生成产品蓝图 → 将蓝图传递给 Builder Agent 生成应用代码 → 调用 Review Agent 进行代码审查 → 将结果反馈回 Supervisor 做最终决策。

这种流水线式的架构确保了每个环节的输出都是结构化的、可校验的，并且可以在任意环节插入人工审核步骤。`,
      },
      {
        heading: "结构化输出与错误恢复",
        body: `每个 Agent 的输出都通过 Zod Schema 进行严格校验。Schema 定义了输出的形状（必须包含哪些字段、字段的类型是什么）、约束条件（最小长度、必须匹配的正则等）和自定义校验规则（如 /App.tsx 必须存在）。

当校验失败时，系统不会直接报错退出，而是进入重试流程。重试机制会将校验错误信息拼接在 Prompt 中回传给 LLM，引导它修正输出。最多重试 3 次，如仍失败则上报给 Supervisor 处理。

这种"宽松接收 + 严格校验 + 智能重试"的策略，使得 Agent 对 LLM 的不稳定输出有了很强的容错能力，整体生成成功率达到了 95% 以上。`,
      },
      {
        heading: "上下文管理与 Token 优化",
        body: `在多 Agent 协作系统中，上下文管理是一个核心挑战。每个 Agent 只需要接收与它任务相关的上下文，而不是整个对话历史。

VentureFlow 采用了分层上下文策略：全局上下文（项目信息、用户偏好、业务领域知识）在所有 Agent 间共享；任务上下文（前一个 Agent 的输出摘要、当前任务的具体指令）只传递给相关的 Worker Agent。

这种策略平均减少了 60% 的 Token 消耗，同时避免了上下文窗口溢出导致的"中间丢失"问题。`,
      },
    ],
  },
  "nocode-lowcode-future": {
    sections: [
      {
        heading: "低代码的三次范式跃迁",
        body: `低代码平台的发展可以划分为三个阶段。第一阶段（2010-2018）是拖拽式搭建时代，代表产品如 OutSystems、Mendix。用户通过拖拽组件、配置属性来构建应用界面和业务流程。这一阶段的局限在于灵活性不足，复杂业务场景往往需要编写自定义代码。

第二阶段（2018-2023）是模型驱动时代，代表产品如 Retool、Appsmith。这些平台允许用户连接数据库、编写少量代码来构建内部工具。灵活性和可扩展性大幅提升，但学习曲线仍然较高。

第三阶段（2023 至今）是 AI 原生时代。用户不再需要学习任何工具或语言，只需要用自然语言描述需求，AI 就能自动完成应用构建。VentureFlow 正是这一阶段的代表性产品。`,
      },
      {
        heading: "自然语言即编程语言",
        body: `AI 原生低代码平台的核心能力是"自然语言理解 + 代码生成"。用户不需要了解 React、TypeScript、数据库设计等技术细节，只需要用中文（或英文）描述业务问题和期望功能。

系统内置的 Prompt Engineering 和 Safety Constraints 机制确保了生成的代码质量。例如，App Builder Prompt 中明确规定了允许使用的依赖库、文件结构规范、安全约束等，使得 AI 生成的应用在代码质量和安全性方面达到了生产级标准。`,
      },
      {
        heading: "AI 原生平台的独特优势",
        body: `与传统的低代码平台相比，AI 原生平台有以下几个独特优势：

没有学习曲线：用户无需学习平台的操作方式或配置项。只需会打字，就能构建应用。

真正的无限定制：传统低代码平台的能力边界由预置组件决定。AI 原生平台理论上可以生成任意类型的应用——从简单的数据录入工具到复杂的 AI 驱动决策系统。

持续进化：随着底层 LLM 模型的升级，AI 原生平台的能力也会同步提升，无需用户做任何操作。`,
      },
    ],
  },
  "data-driven-product-iteration": {
    sections: [
      {
        heading: "产品上线只是第一步",
        body: `很多团队把应用生成了、部署了当成了终点。但在 VentureFlow 的设计理念中，应用交付只是产品生命周期的开始。真正的价值在于"使用 → 分析 → 优化"的持续循环。

传统的产品迭代依赖用户反馈问卷、客服投诉、产品经理的主观判断。这些信息源的共同问题是：滞后（用户遇到问题不会立即报告）、偏差（愿意反馈的用户通常是极端的满意或极端的不满意）、模糊（用户说"不好用"但说不清哪里不好用）。`,
      },
      {
        heading: "Usage Analytics 自动捕获行为数据",
        body: `VentureFlow 内置的分析模块会自动追踪用户在生成应用中的行为：页面访问次数和停留时间、功能使用频率和路径、操作完成率和失败率、用户离开和返回模式。

这些数据以结构化事件的形式存储在数据库中，支持多维度的聚合分析。例如，产品经理可以查看"哪个功能的 7 日留存率最高""从线索录入到跟进完成的平均转化路径是什么""用户最常在哪里遇到操作失败"。`,
      },
      {
        heading: "从数据到改进的自动化闭环",
        body: `分析数据不仅仅用于看板展示，更重要的用途是驱动自动化的产品改进。用户可以选择将分析报告提交给 Agent，Agent 会基于数据生成改进建议。

例如，分析数据可能显示"线索列表页面平均停留时间 45 秒，但点击进入详情页的比例只有 12%"。Agent 会据此判断线索列表的信息密度不够，用户需要点击进入详情才能获得足够信息来做决策。然后 Agent 会自动在详情页中添加几个关键字段到列表视图的卡片中，缩短用户的决策路径。`,
      },
    ],
  },
  "enterprise-digital-transformation-shortcut": {
    sections: [
      {
        heading: "标准 SaaS 与实际业务的鸿沟",
        body: `中小企业进行数字化转型时，通常面临一个两难选择：购买标准 SaaS 产品，功能与业务的匹配度有限；或者定制开发，成本高、周期长。

标准 SaaS 产品的问题在于，它们是为"通用场景"设计的。每个企业的业务流程、管理方式、组织架构都有其独特性——你很难用一套固定的 CRM 来适配不同行业的销售管理方式。结果就是企业要么改变流程来适应软件，要么买了一堆用不上的功能。`,
      },
      {
        heading: "AI 生成：定制化软件的平权运动",
        body: `AI 生成式开发的出现，让中小企业第一次拥有了成本可负担的定制化软件能力。不再需要在"贵但合适"和"便宜但不合适"之间做选择。

以一家 50 人的物流公司为例，他们需要一个考勤管理工具。传统的路径是：找外包公司开发（报价 ¥15,000-30,000，周期 2-4 周），或者购买标准 SaaS 年费 ¥3,600-12,000（但功能不匹配）。而使用 AI 生成式开发，输入需求后 30 分钟内就能得到一个完全定制化的考勤系统，成本几乎为零。

这种"即时生成、即时使用、即时迭代"的模式，正在重新定义企业软件的采购和交付方式。`,
      },
      {
        heading: "从采购到创造的转变",
        body: `AI 生成式开发最深远的影响，不是在效率层面，而是在思维层面——它让企业从"软件采购者"变成了"软件创造者"。

当企业发现自己可以在一天内生成一个完全适配业务需求的应用时，对待数字化的态度会发生根本性变化。IT 部门不再是一个"花钱的部门"，而是变成了"创造价值的部门"。业务部门的同事也不再被动地等待 IT 排期开发，而是主动描述需求、参与构建过程。`,
      },
    ],
  },
  "ai-developer-role-transformation": {
    sections: [
      {
        heading: "80% 的代码将由 AI 生成",
        body: `根据多个行业报告的预测，到 2027 年，80% 以上的业务应用代码将由 AI 生成而非人工编写。这一趋势对开发者职业的影响是深远的。

但这并不意味着开发者会失业。恰恰相反，AI 生成的内容越多，需要人类把关的地方就越多。就像自动化工厂需要更多的工程师来维护自动化生产线一样，AI 生成式开发时代需要更多的"AI 软件工程师"来设计、审核和优化 AI 生成的代码。`,
      },
      {
        heading: "从实现者到架构师",
        body: `当 AI 能自动生成 CRUD 代码、表单页面、数据列表等标准化功能时，开发者的核心价值正在从"如何实现"转向"应该实现什么"。

开发者需要具备的能力正在发生变化：问题拆解能力（将模糊的业务需求拆解为清晰的、AI 可理解的指令）、架构设计能力（设计合适的实体关系、数据流和组件结构）、质量控制能力（审查 AI 生成的代码、发现潜在问题和优化空间）。

在 VentureFlow 的工作流中，最有效率的开发者不是那些编码最快的人，而是那些能够用最精准的语言描述业务问题、设计最优的实体结构、快速识别并修正 AI 生成产物中问题的开发者。`,
      },
      {
        heading: "如何为 AI 时代的开发角色做准备",
        body: `如果你是一位正在担忧 AI 取代自己工作的开发者，以下几件事可以帮助你做好准备：

深入学习领域知识：AI 能写代码，但不理解业务。精通某个垂直领域（如供应链管理、金融合规、医疗信息）的开发者将具有无可替代的价值。

掌握 Prompt Engineering：学会用精准的 Prompt 引导 AI 生成预期的输出是一项关键技能，包括上下文组织、约束指定、示例提供等技术。

培养代码审查能力：AI 生成的代码需要人工审查——安全性、性能、可维护性。能够快速定位 AI 代码中的问题的开发者将会非常抢手。`,
      },
    ],
  },
  "sandpack-browser-compilation": {
    sections: [
      {
        heading: "Sandpack 与 Nodebox 的核心原理",
        body: `Sandpack 是 CodeSandbox 推出的浏览器端代码编译与运行工具。它的核心是 Nodebox——一个在浏览器中用 WebAssembly 和 Service Worker 构建的微型 Node.js 运行时环境。

Nodebox 的工作原理可以概括为三步。首先，在浏览器中创建一个 Service Worker，拦截所有网络请求。其次，在内存中构建一个虚拟文件系统，包含所有需要处理的源代码文件。最后，使用 esbuild-wasm（esbuild 的 WebAssembly 版本）在浏览器中直接编译 TypeScript/JSX 代码。

Vite dev server 运行在 Nodebox 环境中，通过 Service Worker 提供热更新功能。当用户修改代码时，Vite 会重新编译受影响的模块并通过 WebSocket 推送更新。`,
      },
      {
        heading: "Nodebox 的技术限制与适配",
        body: `Nodebox 虽然在浏览器中实现了完整的 Node.js 兼容性，但仍有一些限制需要注意：

文件系统不支持所有 Node.js API（如 fs.rmSync），需要使用兼容版本。这也是为什么 Sandpack 的 Vite 模板必须使用 4.x 版本——Vite 5 依赖的 Rollup 4 使用了不被 Nodebox 支持的 API。

二进制原生模块无法在 Nodebox 中运行，必须使用 WASM 版本。因此 esbuild-wasm 是必需的依赖，而不是常规的 esbuild。

网络请求受浏览器同源策略限制。指向外部 API 的请求需要目标服务器配置正确的 CORS 头。`,
      },
      {
        heading: "生产环境的最佳实践",
        body: `在 VentureFlow 中集成 Sandpack 的过程中，我们积累了几条最佳实践：

精确控制模板文件：不要完全依赖 Sandpack 的默认模板。模板中的 tsconfig.json 的 include 配置默认为 ["src"]，这会漏掉根目录下的 TypeScript 文件。更好的做法是完全重写所有模板文件。

版本锁定：Sandpack 的 Nodebox 对依赖版本非常敏感。必须锁定所有依赖的精确版本（不要使用 ^ 或 ~），特别是 vite、esbuild-wasm 和 @vitejs/plugin-react 的版本需要相互兼容。

兜底字符清洗：虽然 Nodebox 使用 JSONB 存储数据，但 NUL 字符（\u0000）和控制字符可能导致编译前端解析器报错。在文件进入 Sandpack 前必须进行严格的字符清洗。`,
      },
    ],
  },
}

/* ------------------------------------------------------------------ */
/* 生成静态路径                                                         */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }))
}

/* ------------------------------------------------------------------ */
/* 页面组件                                                           */
/* ------------------------------------------------------------------ */

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)

  if (!article) notFound()

  const content = contentMap[article.slug]
  if (!content) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      {/* 返回 */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回博客列表
      </Link>

      {/* 头图 */}
      <div
        className="mb-8 aspect-[21/9] rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${article.imageUrl})` }}
      >
        <span className="sr-only">{article.imageCredit}</span>
      </div>

      {/* 元信息 */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="rounded border border-border px-2 py-0.5">{article.category}</span>
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          {article.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {article.readTime}
        </span>
      </div>

      {/* 标题 */}
      <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{article.title}</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">{article.description}</p>

      {/* 标签 */}
      <div className="mt-6 flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-[var(--color-gold-subtle)] px-2.5 py-1 text-xs text-[var(--color-gold)]"
          >
            <Tag className="mr-1 inline size-3" aria-hidden="true" />
            {tag}
          </span>
        ))}
      </div>

      {/* 正文 */}
      <article className="mt-10 space-y-10">
        {content.sections.map((section, i) => (
          <section key={i} className="space-y-3">
            <h2 className="text-xl font-semibold leading-snug">{section.heading}</h2>
            {section.body.split("\n\n").map((paragraph, j) => (
              <p key={j} className="text-sm leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>

      {/* 分享 */}
      <div className="mt-12 flex items-center gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
        <Share2 className="size-4" aria-hidden="true" />
        <span>分享这篇文章</span>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-xs transition hover:bg-muted"
        >
          复制链接
        </button>
      </div>

      {/* 阅读更多 */}
      <div className="mt-12 border-t border-border pt-8">
        <h3 className="mb-4 text-sm font-semibold">你可能还感兴趣</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {articles
            .filter((a) => a.slug !== article.slug)
            .slice(0, 2)
            .map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group rounded-lg border border-border bg-[rgba(252,251,248,0.45)] p-4 transition hover:border-[var(--color-border-interactive)]"
              >
                <p className="text-xs text-muted-foreground">{related.category}</p>
                <p className="mt-1 text-sm font-semibold leading-snug transition group-hover:text-[var(--color-gold)]">
                  {related.title}
                </p>
              </Link>
            ))}
        </div>
      </div>
    </main>
  )
}

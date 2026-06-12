# VentureFlow MVP Demo Script

## 主线案例：销售管理

1. 打开首页。
2. 输入：我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。
3. 创建项目，进入 Workspace。
4. 展示 Chat + Preview 双栏布局。
5. 展示 Agent 生成 Strategy，并说明 Facts、Assumptions、Validation Questions 和 Success Metrics。
6. 展示 Blueprint 中的页面、实体、工作流和产品决策。
7. 展示 Preview 中可运行的 CRM 应用。
8. 新增一条销售线索。
9. 修改线索状态。
10. 打开公开 Preview，确认版本可访问。
11. 触发 Usage Events，展示 Analytics 聚合指标。
12. 运行 Growth Agent，展示基于真实事件的数据不足提示或优化建议。
13. 提交 Apply Improvement patch request，展示后续版本迭代入口。

## 备用案例

### 客户反馈

客户反馈分散在邮件、群聊和客服系统中，我们无法判断哪些需求最重要，也无法让客户知道需求处理进度。

预期应用模式：`feedback-board`

### 内容运营

内容团队有大量选题，但缺少统一的排期、负责人和发布状态管理，导致内容经常延期。

预期应用模式：`content-planner`

## 演示重点

- VentureFlow 从业务问题出发，而不是从功能清单出发。
- Agent 输出都经过 Zod Schema 校验。
- 生成应用只在 Sandpack 中运行。
- Usage Analytics 和 Growth Agent 只基于真实事件或明确的数据不足状态给出建议。
- 新版本追加保存，不覆盖旧版本。

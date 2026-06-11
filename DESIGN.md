# Design System: VentureFlow

> AI 业务解决方案生成平台

---

## 1. Visual Theme & Atmosphere

VentureFlow 的视觉语言建立在「温暖 + 信心」的双重基调之上。使用奶油色底色（`#f7f4ed`），但引入一缕琥珀金色作为品牌强调色——象征业务的黄金价值和创新的流动感。整体感受像是翻开一本精心印刷的商业计划书：纸张温暖、文字锐利、金色的高亮恰到好处地指引方向。

品牌关键词：**温暖、专业、流动、信任、创新**

所有灰色皆源自 `#1c1c1c` 在不同透明度下的衍生，确保视觉统一性。边框系统以 `#eceae4` 承担被动分割、`rgba(28,28,28,0.4)` 承担交互边界。暗色按钮上的多层内阴影（白色顶部高光线 + 黑色底部环状线）是核心质感签名。

使用 **Amber Gold (`#C88D2B`)** 作为品牌强调色，用于 CTA 主按钮、关键状态标记和流程节点——在温暖中注入一抹能量感。

**核心视觉特征：**

- 奶油纸底 (`#f7f4ed`)
- 琥珀金强调色 (`#C88D2B`) — 象征创新价值
- 不透明度驱动灰阶 — 所有中性色源自 `#1c1c1c` 透明度调制
- 多层内阴影按钮 — 触感深度，白顶光 + 黑底环
- 流动感微渐变 — 琥珀到奶油色的柔和过渡，用于 Hero 和重点区域
- Tailwind CSS + shadcn/ui 组件基元

---

## 2. Color Palette & Roles

### Primary

| CSS Variable        | Value     | Role                             |
| ------------------- | --------- | -------------------------------- |
| `--color-page`      | `#f7f4ed` | 页面背景、卡片表面——温暖纸张基调 |
| `--color-ink`       | `#1c1c1c` | 主文字、标题、深色按钮背景       |
| `--color-ink-light` | `#fcfbf8` | 深色底上的文字、微妙高亮         |

### Brand Accent

| CSS Variable          | Value                   | Role         |
| --------------------- | ----------------------- | ------------ |
| `--color-gold`        | `#C88D2B`               | 品牌强调色   |
| `--color-gold-hover`  | `#A87422`               | 悬停加深     |
| `--color-gold-light`  | `rgba(200,141,43,0.12)` | 金色浅底背景 |
| `--color-gold-subtle` | `rgba(200,141,43,0.06)` | 金色微染背景 |

### Neutral Scale (Opacity-Based)

| CSS Variable      | Value                 | Role                 |
| ----------------- | --------------------- | -------------------- |
| `--color-ink-100` | `#1c1c1c`             | 主文字、标题         |
| `--color-ink-83`  | `rgba(28,28,28,0.83)` | 强二级文字           |
| `--color-ink-82`  | `rgba(28,28,28,0.82)` | 正文                 |
| `--color-muted`   | `#5f5f5d`             | 次要文字、描述、说明 |
| `--color-ink-40`  | `rgba(28,28,28,0.4)`  | 交互边框、按钮轮廓   |
| `--color-ink-08`  | `rgba(28,28,28,0.08)` | 悬停微背景           |
| `--color-ink-04`  | `rgba(28,28,28,0.04)` | 微妙悬停背景         |
| `--color-ink-03`  | `rgba(28,28,28,0.03)` | 几乎不可见的叠加层   |

### Surface & Border

| CSS Variable                 | Value                | Role                       |
| ---------------------------- | -------------------- | -------------------------- |
| `--color-surface`            | `#f7f4ed`            | 卡片背景（与页面底色合一） |
| `--color-border`             | `#eceae4`            | 被动分割线、卡片边框       |
| `--color-border-interactive` | `rgba(28,28,28,0.4)` | 交互元素边框               |

### Semantic

| CSS Variable      | Value     | Role               |
| ----------------- | --------- | ------------------ |
| `--color-success` | `#2D7D46` | 成功状态、完成标记 |
| `--color-warning` | `#C88D2B` | 警告（复用金色）   |
| `--color-error`   | `#C23B3B` | 错误状态           |
| `--color-info`    | `#3B6FAA` | 信息提示           |

### Focus & Interactive

| CSS Variable     | Value                          | Role            |
| ---------------- | ------------------------------ | --------------- |
| `--color-ring`   | `rgba(200,141,43,0.5)`         | 聚焦环（金色）  |
| `--shadow-focus` | `rgba(0,0,0,0.1) 0px 4px 12px` | 聚焦/激活态阴影 |

### Inset Shadows

```css
/* 深色按钮多层内阴影 */
--shadow-button-inset:
  rgba(255, 255, 255, 0.2) 0px 0.5px 0px 0px inset,
  rgba(0, 0, 0, 0.2) 0px 0px 0px 0.5px inset,
  rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

/* 金色按钮多层内阴影 */
--shadow-button-gold-inset:
  rgba(255, 255, 255, 0.25) 0px 0.5px 0px 0px inset,
  rgba(0, 0, 0, 0.15) 0px 0px 0px 0.5px inset,
  rgba(0, 0, 0, 0.08) 0px 1px 2px 0px;
```

---

## 3. Typography Rules

### Font Family

- **Primary**: `"Camera Plain Variable"`, fallbacks: `ui-sans-serif, system-ui, -apple-system`
- **Monospace**: `"JetBrains Mono"`, fallbacks: `ui-monospace, SFMono-Regular, monospace`
- **Weight range**: 400 (body/UI), 480 (special display), 600 (headings)

### Type Scale

| Role            | Font                  | Size (px/rem) | Weight | Line Height | Letter Spacing | Usage            |
| --------------- | --------------------- | ------------- | ------ | ----------- | -------------- | ---------------- |
| Display Hero    | Camera Plain Variable | 60 / 3.75     | 600    | 1.05        | -1.5px         | 首页主标题       |
| Display Alt     | Camera Plain Variable | 60 / 3.75     | 480    | 1.05        | normal         | 轻量级首页变体   |
| Section Heading | Camera Plain Variable | 48 / 3.00     | 600    | 1.05        | -1.2px         | 功能区块标题     |
| Sub-heading     | Camera Plain Variable | 36 / 2.25     | 600    | 1.10        | -0.9px         | 子区块标题       |
| Card Title      | Camera Plain Variable | 20 / 1.25     | 600    | 1.25        | normal         | 卡片标题         |
| Body Large      | Camera Plain Variable | 18 / 1.13     | 400    | 1.38        | normal         | 引言段落         |
| Body            | Camera Plain Variable | 16 / 1.00     | 400    | 1.50        | normal         | 正文             |
| Button          | Camera Plain Variable | 16 / 1.00     | 400    | 1.50        | normal         | 按钮标签         |
| Button Small    | Camera Plain Variable | 14 / 0.88     | 400    | 1.50        | normal         | 紧凑按钮         |
| Link            | Camera Plain Variable | 16 / 1.00     | 400    | 1.50        | normal         | 文本链接         |
| Link Small      | Camera Plain Variable | 14 / 0.88     | 400    | 1.50        | normal         | 页脚链接         |
| Caption         | Camera Plain Variable | 14 / 0.88     | 400    | 1.50        | normal         | 元数据、辅助文本 |
| Code            | JetBrains Mono        | 14 / 0.88     | 400    | 1.60        | normal         | 代码块、技术参数 |
| Nano            | Camera Plain Variable | 12 / 0.75     | 400    | 1.50        | normal         | 标签、徽章       |

### Typography Principles

- **人文主义温暖**: Camera Plain Variable 的微圆终端和有机曲线让平台感觉亲近而非冰冷
- **窄字重系统**: 仅用 400 和 600 两档字重，通过尺寸和间距构建层级，避免视觉噪音
- **标题压缩**: 大尺寸标题使用负字间距（-0.9px 至 -1.5px），营造编辑级紧凑感
- **代码明确**: 技术内容使用 JetBrains Mono，与正文形成清晰的上下文切换
- **可变字重工具**: weight 480 用于特殊展示场景（如 Display Alt），介于 Regular 和 SemiBold 之间的微妙表达

---

## 4. Component Stylings

### Buttons

**Primary Gold（品牌主按钮）**

```css
background: #c88d2b;
color: #fcfbf8;
padding: 10px 20px;
border-radius: 8px;
font-size: 16px;
font-weight: 400;
line-height: 1.5;
box-shadow:
  rgba(255, 255, 255, 0.25) 0px 0.5px 0px 0px inset,
  rgba(0, 0, 0, 0.15) 0px 0px 0px 0.5px inset,
  rgba(0, 0, 0, 0.08) 0px 1px 2px 0px;
/* Hover */
&:hover {
  background: #a87422;
}
/* Active */
&:active {
  opacity: 0.85;
}
/* Focus */
&:focus-visible {
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}
```

**使用场景**: 主要 CTA（"开始生成"、"创建方案"、"立即体验"）

**Primary Dark（深色备选按钮）**

```css
background: #1c1c1c;
color: #fcfbf8;
padding: 10px 20px;
border-radius: 8px;
box-shadow: var(--shadow-button-inset);
/* Hover */
&:hover {
  opacity: 0.9;
}
/* Active */
&:active {
  opacity: 0.8;
}
/* Focus */
&:focus-visible {
  box-shadow: var(--shadow-focus);
}
```

**使用场景**: 与金色按钮成对出现的备选 CTA

**Ghost / Outline**

```css
background: transparent;
color: #1c1c1c;
padding: 8px 16px;
border-radius: 6px;
border: 1px solid rgba(28, 28, 28, 0.4);
/* Hover */
&:hover {
  background: rgba(28, 28, 28, 0.04);
}
/* Active */
&:active {
  opacity: 0.8;
}
/* Focus */
&:focus-visible {
  box-shadow: var(--shadow-focus);
}
```

**使用场景**: 次要操作（"了解更多"、"查看文档"）

**Pill / Icon Button**

```css
background: #f7f4ed;
color: #1c1c1c;
border-radius: 9999px;
padding: 8px 14px;
box-shadow: var(--shadow-button-inset);
opacity: 0.5;
/* Active */
&:active {
  opacity: 0.8;
}
```

**使用场景**: 模式切换、语音输入、附加操作

### Cards

**Standard Card**

```css
background: #f7f4ed;
border: 1px solid #eceae4;
border-radius: 12px;
padding: 24px;
/* 默认无阴影——边框定义边界 */
/* Hover */
&:hover {
  border-color: rgba(28, 28, 28, 0.4);
}
```

**Solution Card（方案卡片）**

```css
background: #f7f4ed;
border: 1px solid #eceae4;
border-radius: 16px;
padding: 32px;
/* 顶部金色微装饰线 */
border-top: 2px solid #c88d2b;
/* Hover */
&:hover {
  border-color: rgba(28, 28, 28, 0.4);
  background: linear-gradient(
    180deg,
    rgba(200, 141, 43, 0.04) 0%,
    #f7f4ed 100%
  );
}
```

**Metric Card（指标卡片）**

```css
background: #f7f4ed;
border: 1px solid #eceae4;
border-radius: 12px;
padding: 24px;
text-align: center;
```

### Inputs & Forms

**Text Input**

```css
background: #f7f4ed;
color: #1c1c1c;
border: 1px solid #eceae4;
border-radius: 8px;
padding: 10px 14px;
font-size: 16px;
font-family: "Camera Plain Variable", ui-sans-serif, system-ui;
/* Placeholder */
&::placeholder {
  color: #5f5f5d;
}
/* Focus */
&:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(200, 141, 43, 0.5);
  border-color: rgba(28, 28, 28, 0.4);
}
```

**AI Prompt Input（AI 对话输入区）**

```css
background: #f7f4ed;
border: 1px solid #eceae4;
border-radius: 16px;
padding: 16px 20px;
min-height: 56px;
font-size: 16px;
/* Focus */
&:focus-within {
  box-shadow: var(--shadow-focus);
  border-color: rgba(28, 28, 28, 0.4);
}
```

### Navigation

**Top Navbar**

```css
position: sticky; top: 0;
background: rgba(247,244,237,0.92);
backdrop-filter: blur(12px);
border-bottom: 1px solid #eceae4;
padding: 12px 24px;
/* Logo */ height: 28px;
/* Links */ font-size: 15px; color: #1c1c1c; font-weight: 400;
/* Active link */ color: #C88D2B;
/* Mobile */ hamburger 菜单 at 768px
```

### Badges & Tags

```css
/* Status Badge */
background: rgba(200, 141, 43, 0.12);
color: #c88d2b;
border-radius: 9999px;
padding: 4px 10px;
font-size: 12px;
font-weight: 400;

/* Category Tag */
background: rgba(28, 28, 28, 0.04);
color: #5f5f5d;
border-radius: 6px;
padding: 4px 8px;
font-size: 12px;
```

### Modals / Dialogs

```css
/* Backdrop */
background: rgba(28, 28, 28, 0.3);
backdrop-filter: blur(4px);

/* Dialog */
background: #f7f4ed;
border: 1px solid #eceae4;
border-radius: 16px;
padding: 32px;
max-width: 520px;
box-shadow: 0px 16px 48px rgba(0, 0, 0, 0.08);

/* Animation */
@keyframes dialog-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### 组件

**Flow Step Indicator（流程步骤指示器）**

```css
/* 容器 */
display: flex;
gap: 0;
align-items: center;
/* 步骤节点 */
width: 32px;
height: 32px;
border-radius: 9999px;
background: #f7f4ed;
border: 2px solid #eceae4;
/* 已完成节点 */
background: #c88d2b;
border-color: #c88d2b;
color: #fcfbf8;
/* 连线 */
height: 2px;
flex: 1;
background: #eceae4;
/* 已完成连线 */
background: #c88d2b;
```

**Solution Template Card（方案模板卡片）**

```css
border: 1px solid #eceae4;
border-radius: 12px;
overflow: hidden;
/* 缩略图 */
aspect-ratio: 16/10;
border-bottom: 1px solid #eceae4;
/* 标题 + 描述 */
padding: 16px;
/* Hover */
&:hover {
  border-color: rgba(28, 28, 28, 0.4);
}
```

---

## 5. Layout Principles

### Spacing System

- **Base unit**: 8px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 208

### Grid

- **Columns**: 12 列栅格
- **Gutter**: 24px（桌面），16px（平板），12px（移动端）
- **Max content width**: 1200px（居中）

### Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}
/* Tablet & Mobile */
@media (max-width: 768px) {
  .container {
    padding-left: 16px;
    padding-right: 16px;
  }
}
```

### Section Spacing

| 区域         | 桌面间距 | 移动端间距 |
| ------------ | -------- | ---------- |
| Hero → 首屏  | 128px    | 64px       |
| 功能区块间   | 96px     | 56px       |
| 区块内部组间 | 56px     | 40px       |
| 卡片间距     | 24px     | 16px       |
| 页脚前       | 128px    | 80px       |

### Border Radius Scale

| 级别        | 值     | 用途                         |
| ----------- | ------ | ---------------------------- |
| Micro       | 4px    | 小型按钮、标签               |
| Standard    | 6px    | 标准按钮、输入框             |
| Comfortable | 8px    | 紧凑卡片、容器               |
| Card        | 12px   | 标准卡片、图片容器           |
| Container   | 16px   | 大容器、对话框、页脚         |
| Full Pill   | 9999px | 操作药丸、图标按钮、步骤节点 |

### Whitespace Philosophy

- **编辑式留白**: 大区块间距（80px–128px），奶油色背景让大面积的「空」变成「呼吸」
- **内容节奏**: 卡片内部紧凑（16–24px）与区块间松弛形成阅读节奏——专注区段与视觉休息交替
- **无分割线**: 区段通过间距而非线条定义边界，仅在必要时使用 `#eceae4` 细线

---

## 6. Depth & Elevation

### Shadow System

| Level   | Name       | CSS                                                                                                                  | Usage              |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Level 0 | Flat       | `none`                                                                                                               | 页面表面、正文内容 |
| Level 1 | Bordered   | `border: 1px solid #eceae4`                                                                                          | 卡片、图片、分割   |
| Level 2 | Inset      | `rgba(255,255,255,0.2) 0px 0.5px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px`   | 深色按钮           |
| Level 3 | Gold Inset | `rgba(255,255,255,0.25) 0px 0.5px 0px inset, rgba(0,0,0,0.15) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.08) 0px 1px 2px` | 金色主按钮         |
| Level 4 | Focus      | `rgba(0,0,0,0.1) 0px 4px 12px`                                                                                       | 聚焦/激活态        |
| Level 5 | Dialog     | `0px 16px 48px rgba(0,0,0,0.08)`                                                                                     | 模态对话框         |
| Level 6 | Ring       | `0 0 0 2px rgba(200,141,43,0.5)`                                                                                     | 键盘聚焦环         |

### Z-Index Scale

| Layer      | Z-Index | Element    |
| ---------- | ------- | ---------- |
| Background | 0       | 页面基底   |
| Content    | 1       | 正文内容   |
| Sticky Nav | 10      | 粘性导航   |
| Dropdown   | 50      | 下拉菜单   |
| Overlay    | 100     | 遮罩层     |
| Modal      | 200     | 模态对话框 |
| Toast      | 300     | 通知提示   |

### Backdrop Effects

```css
/* 导航毛玻璃 */
backdrop-filter: blur(12px);
background: rgba(247, 244, 237, 0.92);

/* 模态遮罩 */
backdrop-filter: blur(4px);
background: rgba(28, 28, 28, 0.3);
```

### Decorative Depth

- **Hero 氛围渐变**: 琥珀金 → 奶油色的柔和径向渐变，位于 Hero 区域背景，浓度极低（opacity 0.3–0.5）
- **方案卡片悬停**: `linear-gradient(180deg, rgba(200,141,43,0.04) 0%, #f7f4ed 100%)`
- **页脚渐变**: 温色调从奶油过渡到更深暖色

### Shadow Philosophy

VentureFlow 的深度系统刻意浅薄。不靠浮起的戏剧性阴影构建层级，而是依赖暖色边框（`#eceae4`）与奶油底色之间的微妙对比来创造温和的容器感。唯一的阴影语法是按钮上的多层内阴影——白色顶部高光线 + 黑色底部细环线 + 柔和投影，营造被按入表面的触感，而非悬浮于表面的漂浮感。

---

## 7. Do's and Don'ts

### ✅ Do

1. **始终使用奶油底色** (`#f7f4ed`) 作为页面基础——这是品牌温暖的根基
2. **金色用于关键 CTA 和品牌节点** —— 每页仅 1-2 处使用金色强调，避免泛滥
3. **所有灰色衍生自 `#1c1c1c` 的不透明度** —— 保持色调统一，不引入独立灰值
4. **深色/金色按钮必须包含多层内阴影** —— 这是质感签名，不可省略
5. **用 `#eceae4` 边框定义卡片容器** —— 它是 VentureFlow 的容器语言
6. **字重仅用 400 和 600** —— 400 用于正文/UI/按钮，600 用于标题/强调
7. **负字间距随字号缩放** —— 60px → -1.5px, 48px → -1.2px, 36px → -0.9px, 16px → normal
8. **代码块使用 JetBrains Mono** —— 与技术正文形成清晰的语境切换

### ❌ Don't

1. **不要使用纯白** (`#ffffff`) 作为页面背景——奶油色是有意为之
2. **不要对卡片使用重阴影**——边框是容器机制，阴影仅在对话框层级使用
3. **不要引入饱和度过高的强调色**——调色板刻意保持温暖中性，金色已足够
4. **不要使用 weight 700 (Bold)**——600 是该系统的最大字重
5. **不要给矩形按钮使用 9999px 圆角**——全圆角仅用于操作药丸和图标按钮
6. **不要使用锐利聚焦轮廓**——系统使用基于柔和阴影的聚焦指示
7. **不要混用边框风格**——`#eceae4` 用于被动，`rgba(28,28,28,0.4)` 用于交互
8. **不要增加标题的字间距**——Camera Plain 设计为在放大时紧凑排列

---

## 8. Responsive Behavior

### Breakpoints

| Name          | Width       | Key Changes                |
| ------------- | ----------- | -------------------------- |
| Mobile Small  | < 600px     | 单列紧凑布局，最小 padding |
| Mobile        | 600–640px   | 标准移动端布局             |
| Tablet Small  | 640–768px   | 2 列网格开始出现           |
| Tablet        | 768–1024px  | 卡片网格展开               |
| Desktop Small | 1024–1280px | 多列布局                   |
| Desktop       | 1280–1536px | 完整功能布局               |
| Large Desktop | ≥ 1536px    | 最大内容宽度，宽阔边距     |

### Touch Targets

- **最小触摸目标**: 44×44px（iOS HIG 标准）
- **按钮 padding**: 10px 20px（金色主按钮），8px 16px（标准按钮）
- **药丸按钮**: 9999px 圆角天然形成大面积点击区域
- **导航链接**: 充足间距，移动端可舒适点触

### Collapsing Strategy

- **Hero 标题**: 60px → 48px → 36px，字间距同步缩放
- **导航**: 水平链接 → 768px 以下切换为汉堡菜单
- **功能卡片**: 3 列 → 2 列 → 单列堆叠
- **方案模板库**: 网格 → 垂直堆叠卡片
- **流程步骤**: 水平排列 → 垂直排列（带箭头方向旋转）
- **指标栏**: 水平 → 垂直堆叠
- **页脚**: 多列 → 单列堆叠
- **区块间距**: 128px → 64px（移动端）

### Font Scaling

- 移动端正文保持 16px（最小可读字号）
- 标题按断点逐级缩小，保持层级关系
- 行高在移动端略微增加（+0.05），补偿窄屏阅读

---

## 9. Agent Prompt Guide

### Quick Reference

```
背景: #f7f4ed
主文字: #1c1c1c
次要文字: #5f5f5d
品牌金: #C88D2B
边框（被动）: #eceae4
边框（交互）: rgba(28,28,28,0.4)
聚焦阴影: rgba(0,0,0,0.1) 0px 4px 12px
聚焦环: rgba(200,141,43,0.5) 0 0 0 2px
深色按钮文字: #fcfbf8
字体: Camera Plain Variable → ui-sans-serif, system-ui
代码字体: JetBrains Mono → ui-monospace, monospace
字重: 400 (body/UI) | 600 (headings) | 480 (special display)
```

### Component Prompts

**1. Hero Section**

```
Create a hero section on cream (#f7f4ed) background. Soft radial gradient from rgba(200,141,43,0.15) at center fading to #f7f4ed. Headline at 60px Camera Plain Variable weight 600, line-height 1.05, letter-spacing -1.5px, color #1c1c1c. Subtitle at 18px weight 400, line-height 1.38, color #5f5f5d, max-width 560px. Two buttons side by side: Primary Gold (#C88D2B bg, #fcfbf8 text, 8px radius, 10px 20px padding, gold inset shadow) and Ghost (transparent, 1px solid rgba(28,28,28,0.4), 6px radius). Vertical padding 128px.
```

**2. Solution Card**

```
Design a solution card on cream (#f7f4ed) background. Border: 1px solid #eceae4. Radius: 16px. 2px solid #C88D2B top border. Padding: 32px. Title at 20px Camera Plain weight 600, line-height 1.25, color #1c1c1c. Description at 14px weight 400, color #5f5f5d. Hover: border changes to rgba(28,28,28,0.4), background gets subtle gold gradient from top.
```

**3. Flow Step Indicator**

```
Build a horizontal flow step indicator. Steps as 32px circles (9999px radius) with 2px solid #eceae4 border, cream bg. Completed steps: #C88D2B bg and border, #fcfbf8 text. Connecting lines: 2px height, #eceae4 (incomplete) / #C88D2B (complete). Step labels below at 12px weight 400, #5f5f5d. Gap between steps: 16px.
```

**4. Navigation**

```
Create a sticky top navbar on rgba(247,244,237,0.92) with backdrop-filter blur(12px). Bottom border: 1px solid #eceae4. Padding: 12px 24px. Logo left: 28px height. Links: Camera Plain 15px weight 400, #1c1c1c, 24px gap. Active link: #C88D2B. Right: Gold CTA button (#C88D2B, inset shadow, 8px radius). Mobile (<768px): hamburger menu.
```

**5. Template Gallery**

```
Build a template gallery: 3-column grid (2-col on tablet, 1-col mobile). Each card: 12px radius, 1px solid #eceae4 border, cream bg, overflow hidden. Top: image with 16:10 aspect ratio, bottom border 1px solid #eceae4. Bottom: 16px padding, title at 16px weight 600 #1c1c1c, category tag below. Hover: border darkens to rgba(28,28,28,0.4). Gap: 24px.
```

**6. AI Prompt Input**

```
Design an AI chat input area. Cream (#f7f4ed) bg, 1px solid #eceae4 border, 16px radius. Min-height 56px, padding 16px 20px, font 16px Camera Plain. Placeholder: #5f5f5d "Describe the business solution you need...". Focus-within: shadow rgba(0,0,0,0.1) 0px 4px 12px, border rgba(28,28,28,0.4). Below: suggestion pills with #eceae4 border, 9999px radius, 12px font. Right side: gold submit pill button.
```

### Iteration Guide

1. **Always use cream** (`#f7f4ed`) as the base — never pure white
2. **Derive all grays** from `#1c1c1c` at opacity levels — not distinct hex values
3. **Use `#eceae4` borders** for card containment — not shadows
4. **Gold is the accent** — use sparingly (1-2 instances per view), never as decoration
5. **Inset shadows on buttons** are mandatory — the tactile signature of the brand
6. **Letter-spacing scales with size**: -1.5px at 60px, -1.2px at 48px, -0.9px at 36px, normal at 16px
7. **Two weights only**: 400 (everything but headings) and 600 (headings)
8. **Camera Plain at 480** is for special display moments — don't overuse
9. **JetBrains Mono** for all code/technical content — creates clear context separation
10. **Flow indicators** use gold for completed steps — reinforces the "flow" metaphor

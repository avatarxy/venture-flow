import { describe, expect, it } from "vitest"
import { inspectBuild } from "./inspect-build"

function createStyledModularFiles() {
  return [
    {
      path: "/App.tsx",
      content:
        "import { DashboardPage } from './pages/DashboardPage'; export default function App() { return <main className=\"min-h-screen bg-background p-6\"><DashboardPage /></main> }",
    },
    {
      path: "/pages/DashboardPage.tsx",
      content:
        "import { Button } from '../components/ui/button'; import { listLeads, saveLead } from '../lib/storage'; export function DashboardPage() { const leads = listLeads(); return <section className=\"grid gap-4\"><p className=\"text-sm\">{leads.length} 条线索</p><Button onClick={() => saveLead({ id: '1', name: 'Acme', status: 'new' })}>新增线索</Button></section> }",
    },
    {
      path: "/pages/LeadsPage.tsx",
      content:
        "import { listLeads, updateLead } from '../lib/storage'; export function LeadsPage() { return <section className=\"grid gap-4\"><input className=\"rounded-md border px-3 py-2\" onChange={() => listLeads()} /><button className=\"rounded-md px-3 py-2\" onClick={() => updateLead('1', { status: 'won' })}>标记成交</button></section> }",
    },
    {
      path: "/pages/CustomersPage.tsx",
      content:
        "import { listCustomers, saveCustomer } from '../lib/storage'; export function CustomersPage() { return <section className=\"grid gap-4\"><p className=\"text-sm\">{listCustomers().length} 个客户</p><button className=\"rounded-md px-3 py-2\" onClick={() => saveCustomer({ id: 'c1', name: 'Acme' })}>新增客户</button></section> }",
    },
    {
      path: "/pages/FollowUpsPage.tsx",
      content:
        "import { listFollowUps, saveFollowUp } from '../lib/storage'; export function FollowUpsPage() { return <form className=\"grid gap-4\" onSubmit={(event) => { event.preventDefault(); saveFollowUp({ id: 'f1', leadId: '1', note: '已电话沟通' }) }}><button className=\"rounded-md px-3 py-2\" type=\"submit\">记录跟进</button><p className=\"text-sm\">{listFollowUps().length} 条记录</p></form> }",
    },
    {
      path: "/pages/TasksPage.tsx",
      content:
        "import { listTasks, toggleTask } from '../lib/storage'; export function TasksPage() { return <section className=\"grid gap-4\"><p className=\"text-sm\">{listTasks().length} 个待办</p><button className=\"rounded-md px-3 py-2\" onClick={() => toggleTask('t1')}>完成待办</button></section> }",
    },
    {
      path: "/components/ui/button.tsx",
      content:
        "import { cva } from 'class-variance-authority'; import { cn } from '../../lib/utils'; const buttonVariants = cva('inline-flex rounded-md px-3 py-2 text-sm font-medium'); export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={cn(buttonVariants())} {...props} /> }",
    },
    {
      path: "/lib/utils.ts",
      content:
        "import { clsx, type ClassValue } from 'clsx'; import { twMerge } from 'tailwind-merge'; export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }",
    },
    {
      path: "/lib/types.ts",
      content:
        "export type Lead = { id: string; name: string; status: string }; export type Customer = { id: string; name: string }; export type FollowUp = { id: string; leadId: string; note: string }; export type Task = { id: string; done?: boolean }",
    },
    {
      path: "/data/seed.ts",
      content:
        "import type { Lead, Customer, FollowUp, Task } from '../lib/types'; export const seedLeads: Lead[] = [{ id: '1', name: 'Acme', status: 'new' }]; export const seedCustomers: Customer[] = [{ id: 'c1', name: 'Acme' }]; export const seedFollowUps: FollowUp[] = []; export const seedTasks: Task[] = [{ id: 't1', done: false }]",
    },
    {
      path: "/lib/storage.ts",
      content:
        "import type { Lead, Customer, FollowUp, Task } from './types'; import { seedLeads, seedCustomers, seedFollowUps, seedTasks } from '../data/seed'; const read = <T,>(key: string, fallback: T[]): T[] => JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T[]; const write = <T,>(key: string, rows: T[]) => localStorage.setItem(key, JSON.stringify(rows)); export function listLeads() { return read<Lead>('vf-generated-leads', seedLeads) } export function saveLead(lead: Lead) { write('vf-generated-leads', [...listLeads(), lead]) } export function updateLead(id: string, patch: Partial<Lead>) { write('vf-generated-leads', listLeads().map((lead) => lead.id === id ? { ...lead, ...patch } : lead)) } export function listCustomers() { return read<Customer>('vf-generated-customers', seedCustomers) } export function saveCustomer(customer: Customer) { write('vf-generated-customers', [...listCustomers(), customer]) } export function listFollowUps() { return read<FollowUp>('vf-generated-follow-ups', seedFollowUps) } export function saveFollowUp(row: FollowUp) { write('vf-generated-follow-ups', [...listFollowUps(), row]) } export function listTasks() { return read<Task>('vf-generated-tasks', seedTasks) } export function toggleTask(id: string) { write('vf-generated-tasks', listTasks().map((task) => task.id === id ? { ...task, done: !task.done } : task)) }",
    },
  ]
}

describe("inspectBuild", () => {
  it("rejects build without App entry", () => {
    const result = inspectBuild({ summary: "bad", files: [{ path: "/index.tsx", content: "export {}" }] })

    expect(result.passed).toBe(false)
    expect(result.issues[0]?.type).toBe("missing_file")
  })

  it("rejects forbidden dependency via import", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "import axios from 'axios'; export default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues[0]?.type).toBe("forbidden_dependency")
    expect(result.issues[0]?.message).toContain("axios")
  })

  it("rejects forbidden dependency via require", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "const fs = require('fs'); export default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "forbidden_dependency" && issue.message.includes("fs"))).toBe(true)
  })

  it("rejects non-whitelisted npm package", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "import dayjs from 'dayjs'; export default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "forbidden_dependency" && issue.message.includes("dayjs"))).toBe(true)
  })

  it("allows whitelisted dependencies", () => {
    const result = inspectBuild({
      summary: "ok",
      files: createStyledModularFiles().concat([
        {
          path: "/components/LeadChart.tsx",
          content: "import React from 'react'; import { BarChart } from 'recharts'; import { Plus } from 'lucide-react'; export function LeadChart() { return <div className=\"rounded-lg border p-4\"><Plus /><BarChart data={[]} /></div> }",
        },
      ]),
    })

    expect(result.passed).toBe(true)
  })

  it("rejects generated apps without localStorage persistence", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "export default function App() { return <button>新增</button> }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "persistence_missing")).toBe(true)
  })

  it("rejects localStorage keys without vf-generated- prefix", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [{ path: "/App.tsx", content: "export default function App() { localStorage.setItem('my-data', '1'); return null }" }],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "persistence_missing" && issue.message.includes("my-data"))).toBe(true)
  })

  it("accepts localStorage keys with vf-generated- prefix", () => {
    const result = inspectBuild({
      summary: "ok",
      files: createStyledModularFiles(),
    })

    expect(result.passed).toBe(true)
  })

  it("rejects forbidden browser boundary APIs", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [
        {
          path: "/App.tsx",
          content:
            "export default function App() { fetch('https://example.com'); document.getElementById('root'); localStorage.setItem('vf-generated-demo', '1'); return null }",
        },
      ],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.filter((issue) => issue.type === "forbidden_dependency").length).toBeGreaterThanOrEqual(2)
    expect(result.issues.map((issue) => issue.message).join(" ")).toContain("外部网络请求")
    expect(result.issues.map((issue) => issue.message).join(" ")).toContain("宿主页面 DOM")
  })

  it("rejects invisible control characters that Sandpack cannot parse", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [
        {
          path: "/App.tsx",
          content: "\u0000export default function App() { localStorage.setItem('vf-generated-demo', '1'); return null }",
        },
      ],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.type === "missing_feature" && issue.message.includes("不可见控制字符"))).toBe(true)
  })

  it("does not flag document.title or document.addEventListener in comments", () => {
    const result = inspectBuild({
      summary: "ok",
      files: createStyledModularFiles().map((file) =>
        file.path === "/App.tsx"
          ? {
              ...file,
              content:
                "// document.getElementById('test') should not trigger\n" + file.content,
            }
          : file,
      ),
    })

    expect(result.passed).toBe(true)
  })

  it("rejects a single-file app even when it has persistence", () => {
    const result = inspectBuild({
      summary: "bad",
      files: [
        {
          path: "/App.tsx",
          content:
            "export default function App() { localStorage.setItem('vf-generated-demo', '1'); return <button className=\"px-3 py-2\">新增线索</button> }",
        },
      ],
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.message.includes("/pages"))).toBe(true)
    expect(result.issues.some((issue) => issue.message.includes("/components/ui"))).toBe(true)
  })

  it("rejects generated apps with fewer than five product pages", () => {
    const result = inspectBuild({
      summary: "bad",
      files: createStyledModularFiles().filter((file) => !["/pages/CustomersPage.tsx", "/pages/FollowUpsPage.tsx", "/pages/TasksPage.tsx"].includes(file.path)),
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.message.includes("至少 5 个"))).toBe(true)
  })

  it("rejects placeholder or under-construction pages", () => {
    const result = inspectBuild({
      summary: "bad",
      files: createStyledModularFiles().map((file) =>
        file.path === "/pages/TasksPage.tsx"
          ? { ...file, content: "export function TasksPage() { return <section className=\"p-6\">建设中</section> }" }
          : file,
      ),
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.message.includes("占位"))).toBe(true)
  })

  it("rejects generated apps without a reusable local-first data layer", () => {
    const result = inspectBuild({
      summary: "bad",
      files: createStyledModularFiles().filter((file) => !["/lib/storage.ts", "/lib/types.ts", "/data/seed.ts"].includes(file.path)),
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.message.includes("数据层"))).toBe(true)
  })

  it("rejects static product pages without user interaction handlers", () => {
    const result = inspectBuild({
      summary: "bad",
      files: createStyledModularFiles().map((file) => ({
        ...file,
        content: file.content
          .replaceAll("onClick", "data-click")
          .replaceAll("onChange", "data-change")
          .replaceAll("onSubmit", "data-submit"),
      })),
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.message.includes("交互"))).toBe(true)
  })

  it("rejects generated apps without Tailwind utility classes", () => {
    const result = inspectBuild({
      summary: "bad",
      files: createStyledModularFiles().map((file) => ({
        ...file,
        content: file.content.replaceAll("className=", "data-class="),
      })),
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.message.includes("Tailwind"))).toBe(true)
  })

  it("rejects components that call cn without importing or defining it", () => {
    const result = inspectBuild({
      summary: "bad",
      files: createStyledModularFiles().map((file) =>
        file.path === "/pages/TasksPage.tsx"
          ? {
              ...file,
              content:
                "export function TasksPage() { return <section className={cn('grid gap-4')}><button onClick={() => null}>刷新</button></section> }",
            }
          : file,
      ),
    })

    expect(result.passed).toBe(false)
    expect(result.issues.some((issue) => issue.message.includes("使用 cn(...) 但没有导入或定义 cn"))).toBe(true)
  })

  it("passes a styled modular generated app", () => {
    const result = inspectBuild({
      summary: "ok",
      files: createStyledModularFiles(),
    })

    expect(result).toEqual({ passed: true, issues: [] })
  })
})

import { describe, expect, it, vi } from "vitest"
import { createInitialAgentState } from "@/server/agent/state-factory"
import { optimizationOutputSchema, productBlueprintSchema, strategyOutputSchema } from "@/server/contracts"
import { validBlueprint } from "@/server/agent/agent-fixtures"
import { createVentureFlowToolSuite } from "./tool-suite"

describe("createVentureFlowToolSuite", () => {
  it("exposes local inspect_build as runtime tool", async () => {
    const suite = createVentureFlowToolSuite()
    const result = await suite.get("inspect_build").execute(
      {
        build: {
          summary: "ok",
          files: [
            {
              path: "/App.tsx",
              content:
                "import { DashboardPage } from './pages/DashboardPage'; export default function App() { return <main className=\"min-h-screen bg-background p-6\"><DashboardPage /></main> }",
            },
            {
              path: "/pages/DashboardPage.tsx",
              content:
                "import { Button } from '../components/ui/button'; import { listLeads, saveLead } from '../lib/storage'; export function DashboardPage() { return <section className=\"grid gap-4\"><p className=\"text-sm\">{listLeads().length} 条线索</p><Button onClick={() => saveLead({ id: '1', name: 'Acme', status: 'new' })}>新增</Button></section> }",
            },
            {
              path: "/pages/LeadsPage.tsx",
              content:
                "import { updateLead } from '../lib/storage'; export function LeadsPage() { return <section className=\"grid gap-4\"><input className=\"rounded-md border px-3 py-2\" onChange={() => null} /><button className=\"rounded-md px-3 py-2\" onClick={() => updateLead('1', { status: 'won' })}>成交</button></section> }",
            },
            {
              path: "/pages/CustomersPage.tsx",
              content:
                "import { listCustomers, saveCustomer } from '../lib/storage'; export function CustomersPage() { return <section className=\"grid gap-4\"><p className=\"text-sm\">{listCustomers().length}</p><button className=\"rounded-md px-3 py-2\" onClick={() => saveCustomer({ id: 'c1', name: 'Acme' })}>新增客户</button></section> }",
            },
            {
              path: "/pages/FollowUpsPage.tsx",
              content:
                "import { saveFollowUp } from '../lib/storage'; export function FollowUpsPage() { return <form className=\"grid gap-4\" onSubmit={(event) => { event.preventDefault(); saveFollowUp({ id: 'f1', leadId: '1', note: 'ok' }) }}><button className=\"rounded-md px-3 py-2\" type=\"submit\">保存跟进</button></form> }",
            },
            {
              path: "/pages/ReportsPage.tsx",
              content:
                "import { listLeads } from '../lib/storage'; export function ReportsPage() { return <section className=\"grid gap-4\"><p className=\"text-sm\">预测 {listLeads().length}</p><button className=\"rounded-md px-3 py-2\" onClick={() => listLeads()}>刷新报表</button></section> }",
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
                "export type Lead = { id: string; name: string; status: string }; export type Customer = { id: string; name: string }; export type FollowUp = { id: string; leadId: string; note: string }",
            },
            {
              path: "/data/seed.ts",
              content:
                "import type { Lead, Customer, FollowUp } from '../lib/types'; export const seedLeads: Lead[] = [{ id: '1', name: 'Acme', status: 'new' }]; export const seedCustomers: Customer[] = []; export const seedFollowUps: FollowUp[] = []",
            },
            {
              path: "/lib/storage.ts",
              content:
                "import type { Lead, Customer, FollowUp } from './types'; import { seedLeads, seedCustomers, seedFollowUps } from '../data/seed'; const read = <T,>(key: string, fallback: T[]) => JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T[]; const write = <T,>(key: string, rows: T[]) => localStorage.setItem(key, JSON.stringify(rows)); export function listLeads() { return read<Lead>('vf-generated-leads', seedLeads) } export function saveLead(lead: Lead) { write('vf-generated-leads', [...listLeads(), lead]) } export function updateLead(id: string, patch: Partial<Lead>) { write('vf-generated-leads', listLeads().map((lead) => lead.id === id ? { ...lead, ...patch } : lead)) } export function listCustomers() { return read<Customer>('vf-generated-customers', seedCustomers) } export function saveCustomer(customer: Customer) { write('vf-generated-customers', [...listCustomers(), customer]) } export function listFollowUps() { return read<FollowUp>('vf-generated-follow-ups', seedFollowUps) } export function saveFollowUp(row: FollowUp) { write('vf-generated-follow-ups', [...listFollowUps(), row]) }",
            },
          ],
        },
      },
      createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"),
    )

    expect(result.summary).toBe("Build inspection passed")
    expect(result.statePatch.review?.passed).toBe(true)
  })

  it("exposes inspect_capabilities as runtime tool and returns capability data", async () => {
    const suite = createVentureFlowToolSuite()
    const result = await suite.get("inspect_capabilities").execute({}, createInitialAgentState("project_1", "销售线索很多，但团队经常忘记跟进"))

    expect(result.summary).toContain("capabilities")
    expect(result.statePatch.capabilities).toBeDefined()
    expect(result.statePatch.capabilities?.maxPages).toBe(8)
    expect(result.statePatch.capabilities?.allowedDependencies).toContain("react")
  })

  it("exposes validate_blueprint as runtime tool", async () => {
    const suite = createVentureFlowToolSuite()
    const state = { ...createInitialAgentState("project_1", "test"), blueprint: validBlueprint }
    const result = await suite.get("validate_blueprint").execute({}, state)

    expect(result.summary).toContain("validation")
  })

  it("throws when generate_application is called without blueprint", async () => {
    const suite = createVentureFlowToolSuite()
    const state = createInitialAgentState("project_1", "test")

    await expect(suite.get("generate_application").execute({}, state)).rejects.toThrow("无法解析 Blueprint")
  })

  it("throws when inspect_build is called without build", async () => {
    const suite = createVentureFlowToolSuite()
    const state = createInitialAgentState("project_1", "test")

    await expect(suite.get("inspect_build").execute({}, state)).rejects.toThrow("无法解析 Build")
  })
})

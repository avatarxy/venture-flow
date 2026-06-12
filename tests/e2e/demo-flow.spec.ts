import { expect, test } from "@playwright/test"

test("demo flow starts from a business problem", async ({ page }) => {
  await page.route("**/api/projects", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        project: {
          id: "demo-project",
          name: "销售团队线索管理",
          originalProblem: "我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。",
          status: "DRAFT",
        },
      }),
    })
  })
  await page.goto("/")
  await page.getByLabel("描述业务问题").fill("我们的销售团队使用 Excel 管理客户和线索，经常忘记跟进，而且负责人无法快速查看当前销售进度。")
  await page.getByRole("button", { name: /创建/ }).click()

  await expect(page).toHaveURL(/\/projects\/demo-project/)
  await expect(page.getByText("Agent 生成 React 应用后，Sandpack 预览会在这里同步出现。")).toBeVisible()
})

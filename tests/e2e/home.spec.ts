import { expect, test } from "@playwright/test"

test("home page exposes the product entry point", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "VentureFlow" })).toBeVisible()
  await expect(page.getByLabel("描述业务问题")).toBeVisible()
  await expect(page.getByRole("button", { name: /创建/ })).toBeDisabled()
})

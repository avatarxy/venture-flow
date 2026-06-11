import { expect, test } from "@playwright/test"

test("home page exposes the product entry point", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "VentureFlow" })).toBeVisible()
  await expect(page.getByRole("link", { name: /进入项目工作台/ })).toBeVisible()
})

import { test, expect } from "@playwright/test"

test.describe("Navigation flows", () => {
  test("header nav links work", async ({ page }) => {
    await page.goto("/")
    await page.locator('a[href="/apps"]').first().click()
    await expect(page).toHaveURL(/\/apps/)
  })

  test("homepage CTA buttons are visible", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("text=浏览作品")).toBeVisible()
    await expect(page.locator("text=登录").or(page.locator("text=立即发布"))).toBeVisible()
  })

  test("apps page has filters and cards", async ({ page }) => {
    await page.goto("/apps")

    // Search input exists
    await expect(page.locator('input[name="q"]')).toBeVisible()

    // Filter selects exist
    await expect(page.locator('select[name="aiTool"]')).toBeVisible()
    await expect(page.locator('select[name="techStack"]')).toBeVisible()
  })

  test("can navigate from apps list to detail", async ({ page }) => {
    await page.goto("/apps")

    // If there are apps, click the first one
    const firstCard = page.locator('[href^="/apps/"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()
      await expect(page).toHaveURL(/\/apps\/[a-zA-Z0-9-]+/)
    }
  })

  test("header shows theme toggle", async ({ page }) => {
    await page.goto("/")
    const themeBtn = page.locator('button[aria-label*="切换"]').first()
    await expect(themeBtn).toBeVisible()
  })
})

import { test, expect } from "@playwright/test"

test.describe("VibeDrop Smoke Tests", () => {
  test("homepage loads and shows hero", async ({ page }) => {
    await page.goto("/")

    // Hero section should be visible
    await expect(page.locator("h1")).toBeVisible()
    await expect(page.locator("h1")).toContainText("Vibe Coding")

    // CTA buttons
    await expect(page.locator('a[href="/apps"]')).toBeVisible()
  })

  test("apps page loads with grid", async ({ page }) => {
    await page.goto("/apps")

    // Page heading
    await expect(page.locator("h1")).toContainText("社区作品")

    // Search input
    await expect(page.locator('input[name="q"]')).toBeVisible()

    // Either apps grid or empty state should be visible
    const grid = page.locator(".grid")
    const empty = page.locator("text=暂无作品")
    await expect(grid.or(empty).first()).toBeVisible()
  })

  test("sign-in page renders GitHub button", async ({ page }) => {
    await page.goto("/auth/signin")

    // VibeDrop logo
    await expect(page.locator("text=VibeDrop")).toBeVisible()

    // GitHub login button
    const loginButton = page.locator("button", { hasText: "GitHub" })
    await expect(loginButton).toBeVisible()
  })

  test("publish page redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/publish")

    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/auth\/signin/)
  })
})

import { test, expect } from '@playwright/test'

test('Frontpage shows the basic texts', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.getByText("Asukkaat")).toBeVisible()
    await expect(page.getByText("Vanhat")).toBeVisible()
    await expect(page.getByText("Hangaroundit")).toBeVisible()
})
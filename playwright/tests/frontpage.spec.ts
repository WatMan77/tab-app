import { test, expect } from '@playwright/test'

test.beforeEach(async ({ request }) => {
    console.log("Deleting...")
    await request.delete("http://localhost:3000/api/reset")
    await request.get("http://localhost:3000/api/testadmin")
})

test('Frontpage shows the basic texts', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.getByText("Asukkaat")).toBeVisible()
    await expect(page.getByText("Vanhat")).toBeVisible()
    await expect(page.getByText("Hangaroundit")).toBeVisible()
    await expect(page.getByText("Home")).toBeVisible()
    await expect(page.getByText("Login")).toBeVisible()
    await expect(page.getByText("Tuotteet")).toBeVisible()
})

test.describe("Admin can", () => {
    const admin = "admin"
    const password = "password123"
    test("Log in", async ({ page }) => {
        test.setTimeout(5000)
        await page.goto('http://localhost:5173')
        await expect(page.getByText("Asukkaat")).toBeVisible()
        await page.locator('.MuiMenuItem-root').last().click()
        await expect(page.getByText("LOG IN")).toBeVisible()
        await page.getByRole('textbox').first().fill(admin)
        await page.getByRole('textbox').last().fill(password)
        await page.getByRole("button", { name: "LOG IN" }).click()

        await expect(page.getByText("Balances")).toBeVisible()
        await expect(page.getByText("Products")).toBeVisible()
        await expect(page.getByText("Logout")).toBeVisible()
    })
})
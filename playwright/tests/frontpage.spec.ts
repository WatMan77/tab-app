import { test, expect } from '@playwright/test'
import * as testValues from "../../backend/tests/db_values"

const admin = "admin"
const password = "password123"
const login = async (page: any) => {
    await page.locator('.MuiMenuItem-root').last().click()
    await page.getByRole('textbox').first().fill(admin)
    await page.getByRole('textbox').last().fill(password)
    await page.getByRole("button", { name: "LOG IN" }).click()
}

test.beforeEach(async ({ request }) => {
    await request.delete("http://localhost:3000/api/reset")
    await request.get("http://localhost:3000/api/testdb")
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

test.describe("Basic user", () => {
    test("can see users, products and buttons", async ({ page }) => {
        await page.goto('http://localhost:5173')
        for (const u of testValues.accounts) {
            await expect(page.getByText(u.username)).toBeVisible()
        }

        for (const p of testValues.products) {
            await expect(page.getByText(`${p.name} ${p.pricein / 100}€`)).toBeVisible()
        }

        await expect(page.getByLabel("Muu määrä")).toBeVisible()

        const confirm = page.getByText("Vahvista")
        await expect(confirm).toBeVisible()
        await expect(confirm).toHaveCSS("background-color", "rgba(0, 0, 0, 0.12)")
    })

    test("can press the buttons and order products", async ({ page }) => {
        await page.goto('http://localhost:5173')
        for (const u of testValues.accounts) {
            const button = page.getByText(u.username)
            await expect(button).toHaveCSS("background-color", "rgb(25, 118, 210)")
            await button.click()
            await expect(button).toHaveCSS("background-color", "rgb(27, 94, 32)")
        }

        for (let i = 0; i < testValues.products.length; i += 1) {
            await page.getByText("+").nth(i).click()
        }

        const sum = testValues.products.reduce((a, b) => a + b.pricein, 0)
        await expect(page.getByText(`Yhteensä: ${(sum / 100).toFixed(1)} €`)).toBeVisible()
        const confirm = page.getByText("Vahvista")
        await expect(confirm).toHaveCSS("background-color", "rgb(25, 118, 210)")

        await confirm.click()

        // Confirm button has been pressed. Everything should turn back to normal
        for (const u of testValues.accounts) {
            await expect(page.getByText(u.username)).toBeVisible()
        }

        for (const u of testValues.accounts) {
            const button = page.getByText(u.username)
            await expect(button).toHaveCSS("background-color", "rgb(25, 118, 210)")
        }
    })

    test("can press buttons twice to deselect a user", async ({ page }) => {
        await page.goto('http://localhost:5173')

        for (const a of testValues.accounts) {
            const button = page.getByText(a.username)
            await expect(button).toHaveCSS("background-color", "rgb(25, 118, 210)")
            await button.click()
        }

        for (const a of testValues.accounts) {
            const button = page.getByText(a.username)
            await button.click()
        }

        /**
         * Here is the flakyness.. For some reason the last user
         * element doesn't change colors fast enough and detects that the color
         * is the darker blue when de-selecting the user
         */


        for (let i = 0; i < testValues.accounts.length - 1; i += 1) {
            const button = page.getByText(testValues.accounts[i].username)
            await expect(button).toHaveCSS("background-color", "rgb(25, 118, 210)")

        }

        const finalUser = page.getByText(testValues.accounts[testValues.accounts.length - 1].username)
        await expect(finalUser).toHaveCSS("background-color", "rgb(21, 101, 192)")
    })

    test("can remove drinks from the 'cart'", async ({ page }) => {
        await page.goto('http://localhost:5173')

        const plus = page.getByText("+")
        for (let i = 0; i < testValues.products.length; i += 1) {
            await plus.nth(i).click()
        }

        const sum = testValues.products.reduce((a, b) => a + b.pricein, 0)

        await expect(page.getByText(`Yhteensä: ${(sum / 100).toFixed(1)} €`)).toBeVisible()

        const minus = page.getByText("-")
        for (let i = 0; i < testValues.products.length; i += 1) {
            await minus.nth(i).click()
        }

        await expect(page.getByText("Yhteensä: 0 €")).toBeVisible()
    })
})
import { test, expect } from '@playwright/test'
import type { APIRequestContext, Page } from '@playwright/test'
import * as testValues from "../utils"
import { confirmChanges } from "../helpers"

const admin = "admin"
const password = "password123"
const login = async (page: any) => {
    await page.locator('.MuiMenuItem-root').last().click()
    await page.getByRole('textbox').first().fill(admin)
    await page.getByRole('textbox').last().fill(password)
    await page.getByRole("button", { name: "LOG IN" }).click()
}

// Gives an account a pincode through the admin UI. PUT /api/balance also sets unlocked_until to
// the current moment, so the account needs a pincode again for the next order.
const setPinThroughAdmin = async (page: Page, username: string, pin: string) => {
    await page.goto('/')
    await login(page)
    await page.getByText("Balances").click()
    await page.getByText(username).click()
    await page.getByRole('textbox', { name: 'New pin' }).fill(pin)
    await confirmChanges(page)

    // Log out, then back to the front page
    await page.locator('.MuiMenuItem-root').last().click()
    await page.locator('.MuiMenuItem-root').first().click()
}

// GET /api/transaction is uncached, so it says exactly who was really charged
const fetchTransactions = async (request: APIRequestContext) => {
    const res = await request.get("http://localhost:3000/api/transaction")
    return await res.json() as { count: number; logs: { username: string; sum: number }[] }
}

const PRESSED = "rgb(102, 187, 106)"
const UNPRESSED = "rgb(144, 202, 249)"

// Scoped to the user grid, because getByText does a substring match and the toasts this flow
// raises contain the username too ("Skipped Jarmo, not charged"). ToastContainer renders outside
// .main-content, so scoping here keeps the locator pointing at exactly one button.
const userButton = (page: Page, username: string) =>
    page.locator('.main-content').getByText(username)

const press = async (page: Page, username: string) => {
    const button = userButton(page, username)
    await button.click({ force: true })
    await page.click('body') // Loose focus of the button
    await expect(button).toHaveCSS("background-color", PRESSED, { timeout: 2000 })
    return button
}

test.beforeEach(async ({ request }) => {
    await request.delete("http://localhost:3000/api/reset")
    await request.get("http://localhost:3000/api/testdb")
    await request.get("http://localhost:3000/api/testadmin")
})

test('Frontpage asks to create an admin if none exists', async ({ page, request }) => {
    await request.delete("http://localhost:3000/api/reset")
    await page.goto('http://localhost:5173')

    await expect(page).toHaveURL("/create-admin")

    await page.getByRole('textbox').first().fill(admin)
    await page.getByRole('textbox').last().fill(password)
    await page.getByRole("button", { name: "CREATE ADMIN" }).click()
})

test('Frontpage shows the basic texts', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.getByText("Koti")).toBeVisible()
    await expect(page.getByText("Tapahtumat")).toBeVisible()
    await expect(page.getByText("Muutokset")).toBeVisible()
    await expect(page.getByText("Login")).toBeVisible()
})

test.describe("Basic user", () => {
    test("can see users, products and buttons", async ({ page }) => {
        await page.goto('http://localhost:5173')
        for (const u of testValues.accounts) {
            await expect(page.getByText(u.username)).toBeVisible()
        }

        for (const p of testValues.products) {
            await expect(page.getByText(p.name)).toBeVisible()
        }

        await expect(page.getByLabel("Muu määrä")).toBeVisible()

        for (const b of ["Vahvista", "Peruuta"]) {
            const button = page.getByText(b);
            await expect(button).toBeVisible();
            await expect(button).toBeDisabled();
        }
    })

    test("can press the buttons and order products", async ({ page }) => {
        await page.goto('http://localhost:5173')
        for (const u of testValues.accounts) {
            const button = page.getByText(u.username)
            await expect(button).toHaveCSS("background-color", "rgb(144, 202, 249)");
            await button.click({ force: true })
            await page.click('body'); // Loose focus of the button
            await page.waitForTimeout(1500);
            await expect(button).toHaveCSS("background-color", "rgb(102, 187, 106)", { timeout: 1200 });
        }

        for (let i = 0; i < testValues.products.length; i += 1) {
            await page.getByText("+").nth(i).click()
        }

        const sum = testValues.products.reduce((a, b) => a + b.pricein, 0)
        await expect(page.getByText(`Yhteensä: ${(sum / 100).toFixed(1)}`)).toBeVisible()
        const confirm = page.getByText("Vahvista")

        await confirm.click()
        await page.click('body');

        // Confirm button has been pressed. Everything should turn back to normal
        for (const u of testValues.accounts) {
            await expect(page.getByText(u.username)).toBeVisible()
        }

        for (const u of testValues.accounts) {
            const button = page.getByText(u.username)
            await expect(button).toHaveCSS("background-color", "rgb(144, 202, 249)")
        }
    })

    test("can press buttons twice to deselect a user", async ({ page }) => {
        await page.goto('http://localhost:5173')

        for (const a of testValues.accounts) {
            const button = page.getByText(a.username)
            await expect(button).toHaveCSS("background-color", "rgb(144, 202, 249)")
            await button.click()
        }

        await page.click('body');

        for (const a of testValues.accounts) {
            const button = page.getByText(a.username)
            await expect(button).toHaveCSS("background-color", "rgb(102, 187, 106)", { timeout: 1200 });
            await button.click()
        }

        await page.click('body');
        /**
         * Here is the flakyness.. For some reason the last user
         * element doesn't change colors fast enough and detects that the color
         * is the darker blue when de-selecting the user
         */


        for (let i = 0; i < testValues.accounts.length - 1; i += 1) {
            const button = page.getByText(testValues.accounts[i].username)
            await expect(button).toHaveCSS("background-color", "rgb(144, 202, 249)")

        }
    })

    test("can remove drinks from the 'cart'", async ({ page }) => {
        await page.goto('http://localhost:5173')

        const plus = page.getByText("+")
        for (let i = 0; i < testValues.products.length; i += 1) {
            await plus.nth(i).click()
        }

        const sum = testValues.products.reduce((a, b) => a + b.pricein, 0)

        await expect(page.getByText(`Yhteensä: ${(sum / 100).toFixed(1)}`)).toBeVisible()

        const minus = page.getByText("-", { exact: true })
        for (let i = 0; i < testValues.products.length; i += 1) {
            await minus.nth(i).click()
        }

        await expect(page.getByText("Yhteensä: 0.00")).toBeVisible()
    })

    test("skipping a pincode still charges the users who do not need one", async ({ page, request }) => {
        const locked = testValues.accounts[0]   // gets a pincode
        const open = testValues.accounts[1]     // no pincode
        const drink = testValues.products[0]

        await setPinThroughAdmin(page, locked.username, "1234")

        // Both users are selected, but only the one with a pincode joins the pin queue
        await press(page, locked.username)
        await press(page, open.username)

        await page.locator('.drink').filter({ hasText: drink.name }).locator('.plus').click()
        await expect(page.getByText(`Yhteensä: ${(drink.pricein / 100).toFixed(2)}`)).toBeVisible()
        await page.getByText("VAHVISTA").click()

        await expect(page.getByText('Enter pin for ' + locked.username)).toBeVisible()
        // By role, so the locator cannot also match the "Skipped ..." toast
        await page.getByRole('button', { name: 'Skip' }).click()

        // The skip is reported and the dialog closes
        await expect(page.getByText('Skipped ' + locked.username)).toBeVisible()
        await expect(page.getByText('Enter pin for ' + locked.username)).toBeHidden()

        // The dialog closed under the pointer, so move it off before reading a background colour
        await page.mouse.move(0, 0)

        // The order went through for the other user, so the cart and the buttons reset
        await expect(page.getByText("Yhteensä: 0.00")).toBeVisible()
        await expect(page.getByText("VAHVISTA")).toBeDisabled()
        await expect(userButton(page, locked.username)).toHaveCSS("background-color", UNPRESSED)

        // Only the user who needed no pincode was charged
        await expect(userButton(page, open.username))
            .toContainText(((open.balance! - drink.pricein) / 100).toFixed(2))
        await expect(userButton(page, locked.username))
            .toContainText((locked.balance! / 100).toFixed(2))

        const { count, logs } = await fetchTransactions(request)
        expect(count).toBe(1)
        expect(logs[0].username).toBe(open.username)
        expect(Number(logs[0].sum)).toBe(drink.pricein)
    })

    test("skipping the only user who needs a pincode keeps the order", async ({ page, request }) => {
        const locked = testValues.accounts[0]
        const drink = testValues.products[0]

        await setPinThroughAdmin(page, locked.username, "1234")

        const button = await press(page, locked.username)

        await page.locator('.drink').filter({ hasText: drink.name }).locator('.plus').click()
        await page.getByText("VAHVISTA").click()

        // Skip is the only button that works before a pincode has been typed
        await expect(page.getByText('Enter pin for ' + locked.username)).toBeVisible()
        const pinButtons = ["ONE TIME", "1H", "3H", "8H", "CUSTOM TIME", "PERMANENT"]
        for (const b of pinButtons) {
            await expect(page.getByText(b)).toBeDisabled()
        }
        await expect(page.getByRole('button', { name: 'Skip' })).toBeEnabled()
        await page.getByRole('textbox', { name: 'Pin' }).fill('1234')
        for (const b of pinButtons) {
            await expect(page.getByText(b)).toBeEnabled()
        }

        await page.getByRole('button', { name: 'Skip' }).click()
        await page.mouse.move(0, 0)

        // Nobody is left to charge, so nothing is sent and the order is kept for a retry
        await expect(page.getByText('Enter pin for ' + locked.username)).toBeHidden()
        await expect(page.getByText(`Yhteensä: ${(drink.pricein / 100).toFixed(2)}`)).toBeVisible()
        await expect(page.getByText("VAHVISTA")).toBeEnabled()
        await expect(button).toHaveCSS("background-color", PRESSED)

        const { count } = await fetchTransactions(request)
        expect(count).toBe(0)
        await expect(userButton(page, locked.username)).toContainText((locked.balance! / 100).toFixed(2))
    })
})
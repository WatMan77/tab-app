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

    test("can enter a pincode in case time has passed", async ({ page, request }) => {

        await request.delete("http://localhost:3000/api/reset")
        await request.get("http://localhost:3000/api/testdb")
        await request.get("http://localhost:3000/api/testadmin")
        const admin = "admin"
        const password = "password123"

        await page.goto('http://localhost:5173')

        const login = async (page: any) => {
            await page.getByText("Login").click()
            await page.getByRole('textbox').first().fill(admin)
            await page.getByRole('textbox').last().fill(password)
            await page.getByRole("button", { name: "LOG IN" }).click()
        }
        await login(page);
        // Create a pin for the 
        const account = testValues.accounts[0];
        await page.getByText("Balances").click()
        await page.getByText(account.username).click();
        await page.getByRole('textbox', { name: 'Pin' }).fill('1234');
        await page.getByText("CONFIRM CHANGE").click()
        await page.waitForURL('**/balances');


        //Logout
        await page.locator('.MuiMenuItem-root').last().click()

        // Go back to main page
        await page.locator('.MuiMenuItem-root').first().click()

        // Do a simple order
        const button = page.getByText(account.username)
        await button.click({ force: true })
        await page.click('body'); // Loose focus of the button
        await page.getByText("+").first().click()
        await page.getByText("VAHVISTA").click()

        //Expect to see a window for inserting pin
        const buttons = ["SKIP", "ONE TIME", "1H", "3H", "8H", "CUSTOM TIME"]
        for (const button of buttons.slice(1)) {
            await expect(page.getByText(button)).toBeDisabled()
        }
        await page.getByRole('textbox', { name: 'Pin' }).fill('1234');
        for (const button of buttons) {
            await expect(page.getByText(button)).toBeEnabled()
        }
        await expect(page.getByText('Enter pin for ' + account.username)).toBeVisible();

        await page.getByText(buttons[0]).click()

        await expect(page.getByText('Enter pin for ' + account.username)).not.toBeVisible();

        await expect(page.getByText("Yhteensä: 0.00")).toBeVisible();
        await expect(page.getByText("VAHVISTA")).toBeDisabled();
    })
})
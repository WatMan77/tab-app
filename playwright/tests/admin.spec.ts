import { test, expect } from '@playwright/test'
import * as testvalues from "../utils";
import { accountRow, confirmChanges, gotoBalances } from "../helpers";
const baseUrl = process.env["BASE_URL"] ?? "http://localhost:5173"


const admin = "admin"
const password = "password123"
const login = async (page: any) => {
    await page.locator('.nav-item').last().click()
    // Fill by label, not by position. Clicking "Login" only starts the navigation, so a
    // positional textbox locator can still bind to the page we came from - the front page
    // has a search box, /balances has the new-account fields. The credentials then land in
    // an input that is about to unmount and the login silently posts an empty username.
    await page.getByLabel("Enter username").fill(admin)
    await page.getByLabel("Enter password").fill(password)
    await page.getByRole("button", { name: "LOG IN" }).click()
}

test.beforeEach(async ({ request }) => {
    await request.delete("http://localhost:3000/api/reset")
    await request.get("http://localhost:3000/api/testadmin")
})

test.describe("Admin can", () => {
    test("Log in", async ({ page }) => {
        await page.goto(baseUrl)
        await page.locator('.nav-item').last().click()
        await expect(page.getByText("LOG IN")).toBeVisible()
        await page.getByLabel("Enter username").fill(admin)
        await page.getByLabel("Enter password").fill(password)
        await page.getByRole("button", { name: "LOG IN" }).click()

        await expect(page.getByText("Balances")).toBeVisible()
        await expect(page.getByText("Products")).toBeVisible()
        await expect(page.getByText("Logout")).toBeVisible()
    })

    test("Log out", async ({ page }) => {
        await page.goto(baseUrl)
        await page.locator('.nav-item').last().click()
        await page.getByLabel("Enter username").fill(admin)
        await page.getByLabel("Enter password").fill(password)
        await page.getByRole("button", { name: "LOG IN" }).click()
        // Due to flakyness, we need these so that the Logout button
        // renders
        await expect(page.getByText("Balances")).toBeVisible()
        await expect(page.getByText("Products")).toBeVisible()
        await expect(page.getByText("Logout")).toBeVisible()

        // Now the logout button should be last
        await page.locator('.nav-item').last().click()
        await expect(page.getByText("Balances")).not.toBeVisible()
        await expect(page.getByText("Products")).not.toBeVisible()
        await expect(page.getByText("Logout")).not.toBeVisible()
        await expect(page.getByText("Login")).toBeVisible()

    })

    test("Create a new account and change bank value", async ({ page }) => {
        test.setTimeout(120000)
        const users = [
            {
                name: "John Does",
                amount: "10",
            },
            {
                name: "Valdemar Walrus",
                amount: "200",
            },
            {
                name: "Henry Hippie",
                amount: "5",
            }
        ]
        await page.goto(baseUrl)
        await login(page)
        await gotoBalances(page)
        // By label, not by position: a positional textbox locator binds to whatever is mounted
        // right now, which can still be the front page's search box.
        const accountName = page.getByLabel("Enter account name")

        for (const u of users) {
            await accountName.fill(u.name) // Enter name
            await expect(accountName).toHaveValue(u.name)
            await page.getByPlaceholder('Enter a value').first().fill(u.amount)
            await page.getByText("CREATE USER").click()

            // Creating a user refetches the list in place, it does not navigate, so the row
            // appearing is the only signal that the POST went through.
            await expect(page.getByText(u.name + " " + u.amount)).toBeVisible()
        }

        // Open user infos
        for (const u of users) {
            await page.getByText(u.name).click();
        }

        for (let i = 0; i < users.length; i += 1) {
            await page.getByPlaceholder("Amount").nth(i).fill("10")
        }

        // Deliberately not page.click('body'): that clicks the centre of the page, which now lands
        // on an expanded row's AccordionSummary and collapses it, unmounting the very fields this
        // test is about to assert on. The sums update on change, so no blur is needed.
        // Now change the value in the bank
        for (let i = 0; i < users.length; i += 1) {
            // 10.00 + 10 = 20.00
            await expect(page.getByText(`${users[i].amount}.00 + 10 = ${parseFloat(users[i].amount) + 10}.00`)).toBeVisible()
        }

        // Confirm the change
        await confirmChanges(page)
        for (let i = 0; i < users.length; i += 1) {
            await page.getByText(users[i].name).click(); // Open user info
            await expect(page.getByText(`${users[i].name} ${parseFloat(users[i].amount) + 10}`)).toBeVisible()
        }

        // Check that the change is visible in "Muutokset" page
        await page.getByText("Muutokset").click();

        const table = page.locator('table');

        // `allTextContents()` is one of the few Playwright calls that does not auto-wait: against
        // a locator that matches nothing yet it returns [] instead of retrying. So wait for the
        // header to render, and for the fetched rows to land, before reading either.
        await expect(table.locator('tr').first()).toBeVisible()
        const firstRow = await table.locator('tr').first().locator('td, th').allTextContents();
        expect(firstRow).toEqual(["Käyttäjä", "Määrä", "Päivämäärä"]);

        await expect(table.locator('tbody tr')).toHaveCount(users.length)
        const tableTexts = await table.locator('tr td').allTextContents();
        for (const u of users) {
            expect(tableTexts).toEqual(expect.arrayContaining([u.name, "10.00"]))
        }
    })

    test("Add new products, edit and delete them", async ({ page }) => {
        await page.goto(baseUrl)
        await login(page)

        const products = [
            {
                name: "Kalja",
                pricein: "1",
                priceout: "1.5",
                color: "WHITE"
            },
            {
                name: "Lonkero",
                pricein: "1.4",
                priceout: "2",
                color: "BLUE"
            },
            {
                name: "Kokis",
                pricein: "0.50",
                priceout: "1.25",
                color: "RED"
            }
        ]

        products.sort((a, b) => a.name.localeCompare(b.name))

        await page.getByText("Products").click()
        for (let i = 0; i < products.length; i += 1) {
            const p = products[i];
            await page.getByPlaceholder("Product name").fill(p.name)
            await page.getByPlaceholder("Price in").fill(p.pricein)
            await page.getByPlaceholder("Price out").fill(p.priceout)
            await page.getByText("ADD PRODUCT").click()
            await page.waitForURL('**/products');
            await page.waitForTimeout(1500);

            // Skip text inputs of new product: 1
            // Skip new product price inputs offset: 2
            await expect(page.locator('input.MuiInputBase-input').nth(1 + i)).toHaveValue(p.name)
            const decimalInputs = page.locator('input[inputmode="decimal"]')
            await expect(decimalInputs.nth(2 + i * 2)).toHaveValue(parseFloat(p.pricein).toFixed(2))
            await expect(decimalInputs.nth(3 + i * 2)).toHaveValue(parseFloat(p.priceout).toFixed(2))
        }

        // Delete the items

        // By accessible name, not by the icon's data-testid: MUI v9 only renders that test id
        // outside production, so it is missing from the built frontend.
        const deleteButtons = page.getByRole('button', { name: 'Delete product' })
        for (let i = 0; i < products.length; i += 1) {
            await deleteButtons.first().click();
            await page.getByText("Kyllä").click();
            await expect(deleteButtons).toHaveCount(products.length - i - 1)
        }
    })

    test("Close and open piikki for a user", async ({ page, request }) => {
        await request.delete("http://localhost:3000/api/reset")
        await request.get("http://localhost:3000/api/testdb")
        await request.get("http://localhost:3000/api/testadmin")
        await page.goto(baseUrl);
        await login(page);

        for (const user of testvalues.accounts) {
            await gotoBalances(page);
            await accountRow(page, user.username).click();
            // One visible button per expanded row. The old `filter({ has: ':visible' })` worked
            // only because MUI eagerly rendered a TouchRipple span inside every button; v9's
            // ripple is lazy, so the button has no child elements and `has` - which requires a
            // descendant - matched nothing. Ask for the button by its accessible name instead.
            await page.getByRole('button', { name: 'Sulje piikki' }).click();
            await page.getByText("Koti").click();

            await expect(page.getByText(user.username)).toBeDisabled();

            await gotoBalances(page);
            await accountRow(page, user.username).click();
            await page.getByText("AVAA PIIKKI").click();

            await page.getByText("Koti").click();

            await expect(page.getByText(user.username)).toBeEnabled();
        }
    })

    test("Use filter in 'Balances'", async ({ page, request }) => {
        await request.delete("http://localhost:3000/api/reset")
        await request.get("http://localhost:3000/api/testdb")
        await request.get("http://localhost:3000/api/testadmin")
        await page.goto(baseUrl);
        await login(page);

        await gotoBalances(page)
        await page.waitForTimeout(2000)

        expect(await page.locator('.account').count()).toBe(testvalues.accounts.length)

        for (const u of testvalues.accounts) {
            await page.getByRole('textbox').nth(2).fill(u.username)
            await page.waitForTimeout(1000);
            expect(await page.locator('.account').count()).toBe(1)
        }

    })
})
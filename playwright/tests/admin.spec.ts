import { test, expect } from '@playwright/test'

const baseUrl = "http://localhost:5173"

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
    await request.get("http://localhost:3000/api/testadmin")
})

test.describe("Admin can", () => {
    test("Log in", async ({ page }) => {
        await page.goto(baseUrl)
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

    test("Log out", async ({ page }) => {
        await page.goto(baseUrl)
        await page.locator('.MuiMenuItem-root').last().click()
        await page.getByRole('textbox').first().fill(admin)
        await page.getByRole('textbox').last().fill(password)
        await page.getByRole("button", { name: "LOG IN" }).click()
        // Due to flakyness, we need these so that the Logout button
        // renders
        await expect(page.getByText("Balances")).toBeVisible()
        await expect(page.getByText("Products")).toBeVisible()
        await expect(page.getByText("Logout")).toBeVisible()

        // Now the logout button should be last
        await page.locator('.MuiMenuItem-root').last().click()
        await expect(page.getByText("Balances")).not.toBeVisible()
        await expect(page.getByText("Products")).not.toBeVisible()
        await expect(page.getByText("Logout")).not.toBeVisible()
        await expect(page.getByText("Login")).toBeVisible()

    })

    test("Create a new account and change bank value", async ({ page }) => {
        test.setTimeout(120000)
        const users = [
            {
                name: "J. Joutomies",
                amount: "10",
                category: "ASUKAS"
            },
            {
                name: "V. Vanha",
                amount: "200",
                category: "VANHA"
            },
            {
                name: "H. Hangaround",
                amount: "5",
                category: "HANGAROUND"
            }
        ]
        await page.goto(baseUrl)
        await login(page)
        await page.getByText("Balances").click()
        for (const u of users) {
            await page.getByRole('textbox').first().fill(u.name) // Enter name
            await page.getByRole('combobox').click() // Select category selector
            await page.getByText(u.category).click()
            await page.getByPlaceholder('Enter a value').first().fill(u.amount)
            await page.getByText("CREATE USER").click()

            // The page refreshes after adding a user. Wait for it to load
            await page.waitForURL('**/balances');
            await expect(page.getByText(u.name + " " + u.amount)).toBeVisible()
        }

        // Open user infos
        for (const u of users) {
            await page.getByText(u.name).click();
        }

        for (let i = 0; i < users.length; i += 1) {
            await page.getByPlaceholder("Change amount").nth(i).fill("10")
        }

        await page.click('body')
        // Now change the value in the bank
        for (let i = 0; i < users.length; i += 1) {
            // 10.00 + 10 = 20.00
            await expect(page.getByText(`${users[i].amount}.00 + 10 = ${parseFloat(users[i].amount) + 10}.00`)).toBeVisible()
        }

        // Confirm the change
        await page.getByText("Confirm change").click()
        await page.waitForURL('**/balances');
        for (let i = 0; i < users.length; i += 1) {
            await page.getByText(users[i].name).click(); // Open user info
            await expect(page.getByText(`${users[i].name} ${parseFloat(users[i].amount) + 10}`)).toBeVisible()
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

        for (let i = 0; i < products.length; i += 1) {
            await page.locator('[data-testid="DeleteIcon"]').first().click();
            await page.getByText("Kyllä").click();
        }

        expect(await page.getByTestId("DeleteIcon").count()).toBe(0)
    })
})
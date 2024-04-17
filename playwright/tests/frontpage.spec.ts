import { test, expect } from '@playwright/test'

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

    test("Log out", async ({ page }) => {
        test.setTimeout(5000)
        await page.goto('http://localhost:5173')
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
        await page.goto('http://localhost:5173')
        await login(page)
        await page.getByText("Balances").click()
        for (const u of users) {
            await page.getByRole('textbox').first().fill(u.name)
            await page.locator('.MuiSelect-select').click()
            await page.getByText(u.category).click()
            await page.getByPlaceholder('Enter a value').first().fill(u.amount)
            await page.getByText("CREATE USER").click()

            // The page refreshes after adding a user. Wait for it to load
            await page.waitForURL('**/balances');
            await expect(page.getByText(u.name + " " + u.amount + " €")).toBeVisible()
        }

        // Now change the value in the bank
        for (let i = 0; i < users.length; i += 1) {
            await page.getByPlaceholder("Enter a value").nth(i + 1).fill("10")
            // 10.00 € + 10 € = 20.00 €
            await expect(page.getByText(`${users[i].amount}.00 € + 10 € = ${parseFloat(users[i].amount) + 10}.00 €`)).toBeVisible()
        }

        // Confirm the change
        await page.getByText("Confirm change").click()
        await page.waitForURL('**/balances');
        for (let i = 0; i < users.length; i += 1) {
            await expect(page.getByText(`${users[i].name} ${parseFloat(users[i].amount) + 10} €`)).toBeVisible()
        }
    })

    test("Add new products and edit them", async ({ page }) => {
        await page.goto('http://localhost:5173')
        await login(page)

        const products = [
            {
                name: "Kalja",
                pricein: "1",
                priceout: "1,5"
            }
        ]

        await page.getByText("Products").click()
        for (const p of products) {
            await page.getByPlaceholder("Product name").fill(p.name)
            await page.getByPlaceholder("Price in").fill(p.pricein)
            await page.getByPlaceholder("Price out").fill(p.priceout)
            await page.getByText("ADD PRODUCT").click()
            await page.waitForURL('**/products');

            // TODO: How do you find a textbox based on the value
            // Then you need to edit it.
            // await expect(page.getByRole('textbox', { name: p.name })).toBeVisible()
            // await expect(page.getByRole('textbox', { name: p.pricein })).toBeVisible()
            // await expect(page.getByRole('textbox', { name: p.priceout })).toBeVisible()

            await expect(page.getByText(`UPDATE ${p.name}`)).toBeVisible()
            await expect(page.getByText(`DELETE ${p.name}`)).toBeVisible()
        }
    })
})
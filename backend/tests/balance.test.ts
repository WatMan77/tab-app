import { describe, test, expect, afterAll, beforeAll } from "bun:test"
import request from "supertest"
import app from "../index"
import { clearDatabase, db, initDb } from "../src/database"
import { accounts, admin, products } from "./db_values"
import bcrypt from "bcrypt"
import { UserType, type Account } from "../src/types"

beforeAll(async () => {
    await initDb()
    await clearDatabase()

    for (const a of accounts) {
        const id = await db.query("INSERT INTO account (username, category, balance) VALUES ($1, $2, $3) RETURNING id", [a.username, a.category, a.balance!.toString()]);
        a.id = id.rows[0].id;
    }

    for (const p of products) {
        await db.query("INSERT INTO product (name, pricein, priceout, color) VALUES ($1, $2, $3, $4)", [p.name, p.pricein.toString(), p.priceout.toString(), p.color])
    }

    // Add the admin to the database
    const hash = await bcrypt.hash(admin.password, 10)
    await db.query("INSERT INTO admin (username, hash) VALUES ($1, $2)", [admin.username, hash])
})

afterAll(() => {
    console.log("Ending it")
    // db.end()
})

describe("Balance", () => {
    let token: string;

    beforeAll(async () => {
        const login = await request(app)
            .post("/api/login")
            .send({ ...admin })
        token = login.body.token
    })
    test("changing the balance for one with correct token", async () => {
        // Change the balance first
        await request(app)
            .put("/api/balance")
            .set("Authorization", "Bearer " + token)
            .send({ accounts: [{ ...accounts[0], balance: accounts[0].balance! - 100, change: -100, newCategory: accounts[0].category }] })
            .expect(201)

        // Check that the balance in the database is correct
        const response = await request(app)
            .get("/api/account/transactions")
            .expect(200)

        const expectedAccount = { ...accounts[0], balance: accounts[0].balance! - 100 };
        delete expectedAccount.id;

        const actualAccounts = response.body.map(({ id, ...rest }: { id?: number }) => rest);
        expect(actualAccounts).toEqual(expect.arrayContaining([expectedAccount]))
    })

    test("change balance for more than one user at a time", async () => {
        // Reset the accounts just for this test
        await db.query("DELETE FROM admin_change; DELETE FROM account;");
        for (const a of accounts) {
            const id = await db.query("INSERT INTO account (username, category, balance) VALUES ($1, $2, $3) RETURNING ID", [a.username, a.category, a.balance!.toString()]);
            a.id = id.rows[0].id;
        }

        const updatedBalances: Account[] = accounts.map(a => ({ ...a, balance: a.balance! - 100, change: -100, newCategory: a.category }))

        await request(app)
            .put("/api/balance")
            .set("Authorization", "Bearer " + token)
            .send({ accounts: updatedBalances })
            .expect(201)

        const updatedAccount = { ...accounts[0], balance: accounts[0].balance! - 100 };
        delete updatedAccount.id

        const response = await request(app)
            .get("/api/account")
            .expect(200)

        // Map the response body to remove IDs for comparison
        const actualAccounts = response.body.map(({ username, category, balance, closed }: { username: string, category: UserType, balance: number, closed: boolean }) => ({
            username,
            category,
            balance,
            closed
        }));
        const expectedAccounts = updatedBalances.map(({ username, category, balance, closed }) => ({
            username,
            category,
            balance,
            closed
        }));

        // Check if the actual accounts include the expected updated account
        expect(actualAccounts).toEqual(expect.arrayContaining(expectedAccounts));

    })
})
import { describe, test, expect, afterAll, beforeEach } from "bun:test"
import request from "supertest"
import app from "../index"
import { clearDatabase, db, initDb } from "../src/database"
import { accounts, admin, products } from "./db_values"
import { UserType, type Account } from "../src/types"
import { redisClient } from "../src/utils"

let token: string;

beforeEach(async () => {
    await initDb()
    await clearDatabase()
    await redisClient.flushAll()

    for (const a of accounts) {
        const id: any = (await db`
        INSERT INTO account (username, category, balance)
        VALUES (${a.username}, ${a.category}, ${a.balance!.toString()})
        RETURNING id
        `)[0];
        a.id = id.id;
    }

    for (const p of products) {
        await db`
        INSERT INTO product (name, pricein, priceout, color)
        VALUES (${p.name}, ${p.pricein.toString()}, ${p.priceout.toString()}, ${p.color})
        `;
    }

    // Add the admin to the database
    const hash = await Bun.password.hash(admin.password)
    await db`
    INSERT INTO admin (username, hash)
    VALUES (${admin.username}, ${hash})
    `;

    // Assign token
    const login = await request(app)
        .post("/api/login")
        .send({ ...admin })
    token = login.body.token
})

afterAll(() => {
    console.log("Ending it")
})

describe("Balance", () => {
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
        const updatedBalances: Account[] = accounts.map(a => ({ ...a, balance: a.balance! - 100, change: -100, newCategory: a.category }))

        await request(app)
            .put("/api/balance")
            .set("Authorization", "Bearer " + token)
            .send({ accounts: updatedBalances })
            .expect(201)

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
        actualAccounts.sort((a: any, b: any) => a.username.localeCompare(b.username));
        expectedAccounts.sort((a, b) => a.username.localeCompare(b.username));
        expect(actualAccounts).toEqual(expectedAccounts);

    })
})
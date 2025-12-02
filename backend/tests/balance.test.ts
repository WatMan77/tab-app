import { describe, test, expect, afterAll, beforeEach, beforeAll } from "bun:test"
import request from "supertest"
import app from "../index"
import { clearDatabase, db, initDb } from "../src/database"
import { admin, products, createRandomAccount } from "./db_values"
import { type Account, type UpdateAccount } from "../src/types"
import { commonFieldMap, redisClient, toNewAccount } from "../src/utils"
import { faker } from '@faker-js/faker';


let token: string;
faker.seed(479407)

const accountAmount = 50;
let accounts: Account[] = []

beforeAll(() => {
    faker.seed(479407)
})
beforeEach(async () => {
    accounts = [
        ...new Map(Array.from({ length: accountAmount }, () => createRandomAccount())
            .map(acc => [acc.username, acc])
        ).values()
    ]
    await initDb()
    await clearDatabase()
    await redisClient.flushAll()

    for (const a of accounts) {
        delete a.pincode
        delete a.unlocked_until
        const { id } = (await db`INSERT INTO account ${db(a)} RETURNING id`)[0]
        a.id = id
    }

    for (const p of products) {
        await db`INSERT INTO product ${db(p)}`
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
    test("changing the balance for one at a time with correct token", async () => {
        const change = -100
        for (const account of accounts) {
            // Change the balance first
            const changedBalance: UpdateAccount[] = [{ ...account, balance: account.balance! + change, change }]
            await request(app)
                .put("/api/balance")
                .set("Authorization", "Bearer " + token)
                .send({ accounts: changedBalance })
                .expect(201)

            // Check that the balance in the database is correct
            const fetchedAccounts = await request(app)
                .get("/api/account/transactions")
                .expect(200)
            const body: any[] = fetchedAccounts.body;
            expect(body).toBeArray()
            const updatedAccounts: Account[] = body.map(a => toNewAccount(a))

            const found = updatedAccounts.find(x => x.username === account.username)
            expect(found).toBeDefined()
            const expectedAccount: Account = { ...account, balance: account.balance! + change }

            const commonFielded = commonFieldMap(account, found)
            expect(expectedAccount).toEqual(commonFielded)

        }
    })

    test("change balance for more than one user at a time", async () => {
        const change = -100
        const updatedBalances: UpdateAccount[] = accounts.map(a => ({ ...a, balance: a.balance! + change, change }))

        await request(app)
            .put("/api/balance")
            .set("Authorization", "Bearer " + token)
            .send({ accounts: updatedBalances })
            .expect(201)

        const response = await request(app)
            .get("/api/account")
            .expect(200)

        const body: any[] = response.body;
        expect(body).toBeArray()
        const updatedAccounts: Account[] = body.map(a => toNewAccount(a))

        for (const account of accounts) {
            const found = updatedAccounts.find(x => x.username === account.username)
            expect(found).toBeDefined()
            const expectedAccount: Account = { ...account, balance: account.balance! + change }

            const commonFielded = commonFieldMap(account, found)
            expect(expectedAccount).toEqual(commonFielded)
        }

    })
})
import { describe, test, expect, afterAll, beforeEach, beforeAll } from "bun:test"
import request from "supertest"
import app from "../index"
import { clearDatabase, db, initDb } from "../src/database"
import { admin, createRandomAccount, products } from "./db_values"
import { type Account } from "../src/types"
import { commonFieldMap, redisClient, toNewAccount } from "../src/utils"
import { faker } from '@faker-js/faker';


const accountAmount = 40;
let accounts: Account[] = []

beforeAll(() => {
    faker.seed(479407)
    accounts = [
        ...new Map(Array.from({ length: accountAmount }, () => createRandomAccount()).map(acc => [acc.username, acc])).values()
    ]
})

beforeEach(async () => {

    await redisClient.flushAll()
    await initDb()
    await clearDatabase()

    for (const acc of accounts) {
        await db`INSERT INTO account ${db(acc)}`;
    }

    await db`INSERT INTO product ${db(products)}`

    // Add the admin to the database
    const hash = await Bun.password.hash(admin.password)
    await db`
    INSERT INTO admin (username, hash)
    VALUES (${admin.username}, ${hash})
    `;

})

afterAll(() => {
    console.log("Ending it")
    // db.end()
})

describe("Accounts", () => {
    test("get all users", async () => {
        const response = await request(app)
            .get("/api/account/transactions")
        const body: any[] = response.body
        expect(body).toBeArray()
        const accs: Account[] = body.map(a => toNewAccount(a))

        // Ensure every account in "accounts" list exists in the response
        accs.forEach(a => {
            const found = accounts.find(x => x.username == a.username)
            expect(found).toBeDefined()

            const commonFielded = commonFieldMap(found!, a)
            expect(commonFielded).toEqual(found!)
        })
    })

    test("add a new account", async () => {
        const login = await request(app)
            .post("/api/login")
            .send({ ...admin })
        const token = login.body.token

        const newAccounts = Array.from({ length: accountAmount }, () => createRandomAccount())

        for (const newAccount of newAccounts) {
            await request(app)
                .post("/api/account")
                .set("Authorization", `Bearer ${token}`)
                .send(newAccount)
                .expect(201)
        }
    })

    test("new accounts are present in the database", async () => {
        const login = await request(app)
            .post("/api/login")
            .send({ ...admin })
        const token = login.body.token
        const newAccounts = Array.from({ length: accountAmount }, () => createRandomAccount())

        for (const newAccount of newAccounts) {
            await request(app)
                .post("/api/account")
                .set("Authorization", `Bearer ${token}`)
                .send(newAccount)
                .expect(201)
        }

        const response = await request(app)
            .get("/api/account/transactions")
        const body: any[] = response.body as any[]
        expect(body).toBeArray()
        const accs: Account[] = body.map(a => toNewAccount(a))
        expect(accs).toHaveLength(accounts.length + newAccounts.length)

        // Ensure every account in "accounts" list exists in the response
        // New ones
        for (const a of newAccounts) {
            const found = accs.find(x => x.username === a.username)
            expect(found).toBeDefined()

            const commonFielded = commonFieldMap(a!, found)
            delete a?.pincode
            delete commonFielded.pincode
            expect(commonFielded).toEqual(a!)
        }

        // Old ones
        for (const a of accounts) {
            const found = accs.find(x => x.username == a.username)
            expect(found).toBeDefined()
            const commonFielded = commonFieldMap(a!, found)
            delete a?.pincode
            delete commonFielded.pincode
            expect(commonFielded).toEqual(a!)
        }
    })

    test("adding same named user should faile", async () => {
        const login = await request(app)
            .post("/api/login")
            .send({ ...admin })
        const token = login.body.validateToken
        const newAccounts = Array.from({ length: accountAmount }, () => createRandomAccount())
        for (const newAccount of newAccounts) {
            await request(app)
                .post("/api/account")
                .set("Authorization", `Bearer ${token}`)
                .send(newAccount)
                .expect(201)
        }
        for (const newAccount of newAccounts) {
            const response = await request(app)
                .post("/api/account")
                .set("Authorization", `Bearer ${token}`)
                .send(newAccount)
                .expect(400)
            expect(response.body.detail).toBe(`Key (username)=(${newAccount.username}) already exists.`)
        }
    })
})
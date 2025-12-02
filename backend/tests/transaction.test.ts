import { describe, test, expect, afterAll, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import app from "../index"
import { db, initDb, clearDatabase } from "../src/database"
import { admin, createRandomAccount, createRandomProduct } from "./db_values"
import type { Transaction, Account, LogInformation, Product } from "../src/types"
import { redisClient, normalize } from "../src/utils"
import { faker } from "@faker-js/faker"

const accountAmount = 50;
const productAmount = 5;
let accounts: Account[] = []
let products: Product[] = []

beforeAll(() => {
    faker.seed(479407)
})

beforeEach(async () => {
    await clearDatabase()
    await redisClient.flushAll()
    await initDb()
    await clearDatabase()

    accounts = [
        ...new Map(Array.from({ length: accountAmount }, () => createRandomAccount())
            .map(acc => [acc.username, acc])
        ).values()

    ]
    products = [
        ...new Map(Array.from({ length: productAmount }, () => createRandomProduct())
            .map(acc => [acc.name, acc])
        ).values()
    ]

    for (const a of accounts) {
        const response = await request(app)
            .post("/api/account")
            .send(a)
            .expect(201)
        a.id = response.body.id
    }

    for (const p of products) {
        await db`
        INSERT INTO product ${db(p)}`
    }
    // Add the admin to the database
    const hash = Bun.password.hashSync(admin.password)
    await db`
    INSERT INTO admin (username, hash)
    VALUES (${admin.username}, ${hash})
    `;
})

afterAll(() => {
    console.log("Ending it")
    //db.end()
})

describe("Transaction", () => {
    test("correct transaction for single user", async () => {
        for (const [i, account] of accounts.entries()) {
            const product = products[faker.number.int({ min: 0, max: products.length - 1 })]
            const amount = faker.number.int({ min: 1, max: 10 });
            const transaction: Transaction = {
                items: [{ product, amount }],
                users: [account]
            }
            await request(app)
                .post("/api/transaction")
                .send(transaction)
                .expect(200)

            // Check that the logs have the transaction
            const logs = await request(app)
                .get("/api/transaction")
                .expect(200)


            const response: LogInformation = logs.body
            const t_info = response.logs
            expect(t_info).toHaveLength(i + 1)

            expect(t_info[i]).toHaveProperty("username")
            expect(t_info[i]).toHaveProperty("product_name")
            expect(t_info[i]).toHaveProperty("amount")
            expect(t_info[i]).toHaveProperty("transaction_date")


            // Check that the amount subtracted is correct
            const db_accounts = await request(app)
                .get("/api/account/transactions")
                .expect(200)

            const user: Account = db_accounts.body.find((x: Account) => x.username === account.username)
            expect(user).toBeDefined()
            expect(user.balance).toBe(account.balance! - (product.pricein * amount))
        }
    })

    test("many users, many different products", async () => {

        // Reset data for this database
        const items = products.map(p => ({ product: p, amount: faker.number.int({ min: 1, max: 10 }) }))

        const transaction: Transaction = {
            items,
            users: accounts
        }

        await request(app)
            .post("/api/transaction")
            .send(transaction)
            .expect(200)

        const db_accounts = await request(app)
            .get("/api/account/transactions")
            .expect(200)

        const totalCost = transaction.items.reduce((total, { product, amount }) => {
            return total + product.pricein * amount;
        }, 0);

        for (const u of db_accounts.body) {
            // First find the original price
            const original = accounts.find(x => x.username === u.username)
            expect(original).toBeDefined()
            expect(u.balance).toBe(original!.balance! - totalCost)
        }
    })

    // Correct pincodes are tested in previous tests
    test("wrong pincode doesn't allow for updating balance", async () => {
        // There is a small bug when it comes to filtering by date
        const pinAccounts = accounts.filter(a => a.pincode && a.unlocked_until && normalize(a.unlocked_until) < normalize(new Date()))
        const users = pinAccounts.map(a => ({ ...a, pincode: a.pincode!.split("").reverse().join("") }))
        const transaction: Transaction = {
            items: products.map(p => ({ product: p, amount: 1 })),
            users: users
        }

        const response = await request(app)
            .post("/api/transaction")
            .send(transaction)
            .expect(207) // <-- testing 400 would be better
        /*for (const account of users) {
            expect(response.text).toContain("Wrong pincode for " + account.username)
        }*/
    })
})
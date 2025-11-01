import { describe, test, expect, afterAll, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import app from "../index"
import { db, initDb, clearDatabase } from "../src/database"
import { accounts, admin, products } from "./db_values"
import bcrypt from "bcrypt"
import type { Transaction, Log, Account } from "../src/types"
import { redisClient } from "../src/utils"

let token: string;

beforeAll(async () => {
    await initDb()
    await clearDatabase()

    for (const a of accounts) {
        await db`
        INSERT INTO account (username, category, balance)
        VALUES (${a.username}, ${a.category}, ${a.balance!.toString()})
        `;
    }

    for (const p of products) {
        await db`
        INSERT INTO product (name, pricein, priceout, color)
        VALUES (${p.name}, ${p.pricein.toString()}, ${p.priceout.toString()}, ${p.color})
        `;
    }

})
beforeEach(async () => {
    await clearDatabase()
    await redisClient.flushAll()
    // Add the admin to the database
    const hash = await bcrypt.hash(admin.password, 10)
    await db`
    INSERT INTO admin (username, hash)
    VALUES (${admin.username}, ${hash})
    `;
    const login = await request(app)
        .post("/api/login")
        .send({ ...admin })
        .expect(200)
    token = login.body.token
})

afterAll(() => {
    console.log("Ending it")
    //db.end()
})

describe("Transaction", () => {
    test("correct transaction for single user", async () => {

        // Add users first
        let account: Account = accounts[0]
        const res: { username: string; id: number } = (await db`
        INSERT INTO account (username, category, balance)
        VALUES (${account.username}, ${account.category}, ${account.balance!.toString()})
        RETURNING username, id
        `)[0];
        const product = products[0]
        const transaction: Transaction = {
            items: [{ product, amount: 1 }],
            users: [{ ...account, id: res.id }]
        }
        await request(app)
            .post("/api/transaction")
            .send(transaction)
            .expect(200)

        // Check that the logs have the transaction
        const logs = await request(app)
            .get("/api/transaction")
            .expect(200)


        const t_info: Log[] = logs.body
        expect(t_info).toHaveLength(1)

        expect(t_info[0]).toHaveProperty("username")
        expect(t_info[0]).toHaveProperty("product_name")
        expect(t_info[0]).toHaveProperty("amount")
        expect(t_info[0]).toHaveProperty("transaction_date")


        // Check that the amount subtracted is correct
        const db_accounts = await request(app)
            .get("/api/account/transactions")
            .expect(200)

        const user: Account = db_accounts.body.find((x: Account) => x.username === account.username)
        expect(user).toBeDefined()
        expect(user.balance).toBe(account.balance! - product.pricein)
    })

    test("many users, many different products", async () => {

        // Reset data for this database
        let ids: Map<string, number> = new Map();
        await db`DELETE FROM account`;
        for (const a of accounts) {
            const query = await db`
                INSERT INTO account (username, category, balance)
                VALUES (${a.username}, ${a.category}, ${a.balance!.toString()})
                RETURNING username, id
                `;
            const user: { id: number, username: string } = query[0];
            ids.set(user.username, user.id);
        }

        const product1 = { product: products[0], amount: 1 }
        const product2 = { product: products[1], amount: 3 }
        const product3 = { product: products[2], amount: 5 }
        const transaction: Transaction = {
            items: [product1, product2, product3],
            users: accounts.map((a) => {
                return { ...a, id: ids.get(a.username) }
            })
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

    test("account with set pincode can make transaction", async () => {
        // Add a pincode to a user
        let account: Account = accounts[0]
        const res: { username: string; id: number } = (await db`
            INSERT INTO account (username, category, balance)
            VALUES (${account.username}, ${account.category}, ${account.balance!.toString()})
            RETURNING username, id
            `)[0];

        const product = products[0]
        const transaction: Transaction = {
            items: [{ product, amount: 1 }],
            users: [{ ...account, id: res.id, pincode: "1234" }]
        }
        await request(app)
            .put("/api/balance")
            .set("Authorization", "Bearer " + token)
            .send({ accounts: [{ ...transaction.users[0] }] })
            .expect(201)

        await request(app)
            .post("/api/transaction")
            .send(transaction)
            .expect(200)

    })

    test("wrong pincode doesn't allow for updating balance", async () => {
        // Add a pincode to a user
        let account: Account = accounts[0]
        const res: { username: string; id: number } = (await db`
        INSERT INTO account (username, category, balance)
        VALUES (${account.username}, ${account.category}, ${account.balance!.toString()})
        RETURNING username, id
        `)[0];
        const product = products[0]
        const transaction: Transaction = {
            items: [{ product, amount: 1 }],
            users: [{ ...account, id: res.id, pincode: "1234" }]
        }
        await request(app)
            .put("/api/balance")
            .set("Authorization", "Bearer " + token)
            .send({ accounts: [{ ...transaction.users[0] }] })
            .expect(201)
        //Set wrong pincode
        transaction.users[0].pincode = "4321"
        // Unlocked until is not taken into consideration when updating pin. Instead, Wait 1.5s so
        // the time difference is enough
        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = await request(app)
            .post("/api/transaction")
            .send(transaction)
            .expect(400)
        expect(response.text).toContain("Wrong pincode for " + account.username)
    })
})
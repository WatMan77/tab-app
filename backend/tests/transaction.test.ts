import { describe, test, expect, afterAll, beforeAll } from "bun:test"
import request from "supertest"
import app from "../index"
import { db, initDb } from "../src/database"
import { accounts, admin, products } from "./db_values"
import bcrypt from "bcrypt"
import type { Transaction, Log, Account } from "../src/types"

beforeAll(async () => {
    await initDb()

    await db.query("DELETE FROM account; DELETE FROM product; DELETE FROM transaction; DELETE FROM admin;")

    for (const a of accounts) {
        await db.query("INSERT INTO account (username, category, balance) VALUES ($1, $2, $3)", [a.username, a.category, a.balance!.toString()])
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
    //db.end()
})

describe("Transaction", () => {
    test("correct transaction for single user", async () => {

        const account = accounts[0]
        const product = products[0]
        const transaction: Transaction = {
            items: [{ product: product, amount: 1 }],
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
        await db.query("DELETE FROM account;")
        for (const a of accounts) {
            await db.query("INSERT INTO account (username, category, balance) VALUES ($1, $2, $3)", [a.username, a.category, a.balance!.toString()])
        }

        const product1 = { product: products[0], amount: 1 }
        const product2 = { product: products[1], amount: 3 }
        const product3 = { product: products[2], amount: 5 }
        const transaction: Transaction = {
            items: [product1, product2, product3],
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
})
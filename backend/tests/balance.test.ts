import { describe, test, expect, afterAll, beforeAll } from "@jest/globals"
import request from "supertest"
import app from "../index"
import { db, initDb } from "../src/database"
import { accounts, admin, products } from "./db_values"
import bcrypt from "bcrypt"
import { Account } from "../src/types"

beforeAll(async () => {
    await initDb()

    await db.query("DELETE FROM account; DELETE FROM product; DELETE FROM transaction; DELETE FROM admin;")

    for (const a of accounts) {
        await db.query("INSERT INTO account (username, category, balance) VALUES ($1, $2, $3)", [a.username, a.category, a.balance!.toString()])
    }

    for (const p of products) {
        await db.query("INSERT INTO product (name, pricein, priceout) VALUES ($1, $2, $3)", [p.name, p.pricein.toString(), p.priceout.toString()])
    }

    // Add the admin to the database
    const hash = await bcrypt.hash(admin.password, 10)
    await db.query("INSERT INTO admin (username, hash) VALUES ($1, $2)", [admin.username, hash])
})

afterAll(() => {
    console.log("Ending it")
    db.end()
})

describe("Balance", () => {
    let token: string;

    beforeAll(async () => {
        const login = await request(app)
            .post("/api/login")
            .send({ ...admin })
        console.log("What is the token?", login.body.token)
        token = login.body.token
    })
    test("changing the balance for one with correct token", async () => {
        // Change the balance first
        await request(app)
            .put("/api/balance")
            .set("Authorization", "Bearer " + token)
            .send({ accounts: [{ ...accounts[0], balance: accounts[0].balance! - 100 }] })
            .expect(201)

        // Check that the balance in the database is correct
        const response = await request(app)
            .get("/api/account")
            .expect(200)

        expect(response.body).toContainEqual({ ...accounts[0], balance: accounts[0].balance! - 100 })
    })

    test("change balance for more than one user at a time", async () => {
        // Reset the accounts just for this test
        await db.query("DELETE FROM account;");
        for (const a of accounts) {
            await db.query("INSERT INTO account (username, category, balance) VALUES ($1, $2, $3)", [a.username, a.category, a.balance!.toString()])
        }

        const updatedBalances: Account[] = accounts.map(a => ({ ...a, balance: a.balance! - 100 }))

        await request(app)
            .put("/api/balance")
            .set("Authorization", "Bearer " + token)
            .send({ accounts: updatedBalances })
            .expect(201)

        const response = await request(app)
            .get("/api/account")
            .expect(200)

        expect(response.body).toEqual(updatedBalances)
    })
})
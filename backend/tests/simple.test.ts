import { describe, test, expect, beforeEach, afterAll, beforeAll } from "@jest/globals"
import request from "supertest"

import app from "../index"
import { db, initDb } from "../src/database"

import { accounts, admin, products } from "./db_values"

beforeAll(async () => {
    // await initDb()

    await db.query("DELETE FROM account; DELETE FROM product; DELETE FROM transaction; DELETE FROM admin;")

    for (const a of accounts) {
        await db.query("INSERT INTO account (username, category, balance) VALUES ($1, $2, $3)", [a.username, a.category, a.balance!.toString()])
    }

    for (const p of products) {
        await db.query("INSERT INTO product (name, pricein, priceout) VALUES ($1, $2, $3)", [p.name, p.pricein.toString(), p.priceout.toString()])
    }
})

afterAll(() => {
    console.log("Ending it")
    db.end()
})

describe("simple", () => {
    test("test", () => {
        expect(1).toBe(1)
    })
})

describe("Accounts", () => {
    test("get all users", async () => {
        const response = await request(app)
            .get("/api/account")
        console.log("What is the response?")
        console.log(response.body)
        expect(response.body).toEqual(accounts)
        expect(1).toBe(1)
    })
})
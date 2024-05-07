import { describe, test, expect, afterAll, beforeAll } from "bun:test"
import request from "supertest"
import app from "../index"
import { db, initDb } from "../src/database"
import { accounts, admin, products } from "./db_values"
import bcrypt from "bcrypt"
import { type Account, UserType } from "../src/types"

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
    // db.end()
})

describe("Accounts", () => {
    test("get all users", async () => {
        const response = await request(app)
            .get("/api/account/transactions")
        expect(response.body).toEqual(expect.arrayContaining(accounts));

    })

    test("add a new account", async () => {
        const login = await request(app)
            .post("/api/login")
            .send({ ...admin })
        const token = login.body.token

        const newUser: Account = {
            username: "Jerry",
            category: UserType.VANHA,
            balance: 0,
            closed: false,
            recent: null
        }

        await request(app)
            .post("/api/newaccount")
            .set("Authorization", `Bearer ${token}`)
            .send(newUser)
            .expect(201)

    })
})
import { describe, test, expect, afterAll, beforeEach } from "bun:test"
import request from "supertest"
import app from "../index"
import { clearDatabase, db, initDb } from "../src/database"
import { accounts, admin, products } from "./db_values"
import bcrypt from "bcrypt"
import { type Account, UserType } from "../src/types"

beforeEach(async () => {
    await initDb()
    await clearDatabase()

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
    // db.end()
})

describe("Accounts", () => {
    test("get all users", async () => {
        const response = await request(app)
            .get("/api/account/transactions")
        const accs = response.body.map(({ id, ...rest }: (any)) => rest)
        accs.sort((a: any, b: any) => a.username.localeCompare(b.username));
        const accCopy = [...accounts].map(({ balance, category, closed, username, recent, pincode, unlocked_until }) => ({
            balance,
            category,
            closed,
            pincode,
            recent,
            username,
            unlocked_until
        }))
        accCopy.sort((a, b) => a.username.localeCompare(b.username));
        expect(accs).toEqual(accCopy)

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
            recent: null,
            pincode: null,
            unlocked_until: null

        }

        await request(app)
            .post("/api/newaccount")
            .set("Authorization", `Bearer ${token}`)
            .send(newUser)
            .expect(201)

    })
})
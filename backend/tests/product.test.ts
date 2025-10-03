import { describe, test, expect, afterAll, beforeAll } from "bun:test"
import request from "supertest"
import app from "../index"
import { db, initDb, clearDatabase } from "../src/database"
import { accounts, admin, products } from "./db_values"
import bcrypt from "bcrypt"
import type { Product } from "../src/types"
import { Color } from "../src/types"
import { redisClient } from "../src/utils"

beforeAll(async () => {
    await initDb()
    await clearDatabase()
    await redisClient.flushAll()

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

describe("Products with correct token", () => {
    let token: string;

    beforeAll(async () => {
        const login = await request(app)
            .post("/api/login")
            .send({ ...admin })
        token = login.body.token
    })

    test("get products", async () => {
        const response = await request(app)
            .get("/api/product")
            .expect(200)

        expect(response.body).toEqual(products)
    })

    test("add a new drink", async () => {
        const newProduct: Product = {
            name: "Skumppa",
            pricein: 900,
            priceout: 1000,
            color: Color.YELLOWBLACK
        }
        // Add the new drink
        await request(app)
            .post("/api/product")
            .set("Authorization", "Bearer " + token)
            .send(newProduct)
            .expect(200)

        const response = await request(app)
            .get("/api/product")
            .expect(200)

        expect(response.body).toContainEqual(newProduct)
    })

    test("update values of a drink", async () => {
        // Will the previous test affect this?

        // Change the values of "Kalja"
        const updatedProduct = {
            newName: "Bisse",
            pricein: 200,
            priceout: 300,
            name: "Kalja",
            color: Color.WHITE
        }
        await request(app)
            .put("/api/product")
            .set("Authorization", "Bearer " + token)
            .send(updatedProduct)
            .expect(201)

        const response = await request(app)
            .get("/api/product")
            .expect(200)

        expect(response.body).toContainEqual({
            pricein: 200,
            priceout: 300,
            name: "Bisse",
            color: Color.WHITE
        })
        expect(response.body).not.toContainEqual(products[0])
    })

    test("delete a drink", async () => {
        await request(app)
            .delete("/api/product/" + products[1].name)
            .set("Authorization", "Bearer " + token)
            .expect(204)

        const response = await request(app)
            .get("/api/product")
            .expect(200)

        expect(response.body).not.toContainEqual(products[1])
    })
})
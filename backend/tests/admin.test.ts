import { describe, test, expect, beforeAll } from "bun:test"
import request from "supertest"
import app from "../index"
import { db } from "../src/database"
import { admin } from "./db_values"
import bcrypt from "bcrypt"

beforeAll(async () => {
    const hash = await bcrypt.hash(admin.password, 10)
    await db.query("INSERT INTO admin (username, hash) VALUES ($1, $2)", [admin.username, hash])
})

describe("Admin", () => {
    test("correct credentials give a token", async () => {
        const response = await request(app)
            .post("/api/login")
            .send({ ...admin })
            .expect('Content-Type', /json/)
            .expect(200)

        expect(response.body).toHaveProperty("token")
    })

    test("wrong credentials don't give a token", async () => {
        const response = await request(app)
            .post("/api/login")
            .send({ username: "NotAUser", password: "NotAPassword" })
            .expect(401)
    })
})
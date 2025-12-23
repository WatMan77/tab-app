import { describe, test, expect, beforeAll } from "bun:test";
import request from "supertest";
import app from "../index";
import { clearDatabase, db, initDb } from "../src/database";
import { admin } from "./db_values";
import { redisClient } from "../src/utils";

beforeAll(async () => {
    await initDb();
    await clearDatabase();
    await redisClient.flushAll();
    const hash = await Bun.password.hash(admin.password);
    await db`
    INSERT INTO admin (username, hash)
    VALUES (${admin.username}, ${hash})
    `;
});

describe("Admin", () => {
    test("correct credentials give a token", async () => {
        const response = await request(app)
            .post("/api/login")
            .send({ ...admin })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty("token");
    });

    test("wrong credentials don't give a token", async () => {
        await request(app)
            .post("/api/login")
            .send({ username: "NotAUser", password: "NotAPassword" })
            .expect(401);
    });
});
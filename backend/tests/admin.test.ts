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

    test("Add first admin without token and reject second admin without valid token", async () => {
        await clearDatabase();
        const noAdmin = await request(app)
            .get("/api/admin/admin-check")
            .expect(200)
        expect(noAdmin.body).toHaveProperty("adminExists")
        expect(noAdmin.body.adminExists).toBe(false)

        await request(app)
            .post("/api/admin")
            .send({ ...admin })
            .expect(201)

        // No token
        await request(app)
            .post("/api/admin")
            .send({ ...admin })
            .expect(400)

        // Invalid token
        await request(app)
            .post("/api/admin")
            .set("Authorization", "Bearer notAToken")
            .send({ ...admin })
            .expect(401)
    })

    test("Add a second admin with a valid token", async () => {
        const login = await request(app)
            .post("/api/login")
            .send({ ...admin });
        const token = login.body.token;
        await request(app)
            .post("/api/admin")
            .set("Authorization", "Bearer " + token)
            .send({
                username: "BossAdmin",
                password: "SecretPassword"
            })
            .expect(201)
        await request(app)
            .post("/api/login")
            .send({ ...admin })
            .expect(200)

    })
});
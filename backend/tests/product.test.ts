import { describe, test, expect, afterAll, beforeAll, beforeEach } from "bun:test";
import request from "supertest";
import app from "../index";
import { db, initDb, clearDatabase } from "../src/database";
import { admin, createRandomAccount, createRandomProduct } from "./db_values";
import type { Product, Account } from "@app/common";
import { Color } from "@app/common";
import { redisClient, toNewProduct } from "../src/utils";
import { faker } from '@faker-js/faker';

const accountAmount = 50;
const productAmount = 5;
let accounts: Account[] = [];
let products: Product[] = [];
let token: string;

beforeAll(() => {
    faker.seed(479407);
});

beforeEach(async () => {
    accounts = [
        ...new Map(Array.from({ length: accountAmount }, () => createRandomAccount())
            .map(acc => [acc.username, acc])
        ).values()
    ];
    products = [
        ...new Map(Array.from({ length: productAmount }, () => createRandomProduct())
            .map(acc => [acc.name, acc])
        ).values()
    ];
    await initDb();
    await clearDatabase();
    await redisClient.flushAll();

    for (const a of accounts) {
        const { id } = (await db`INSERT INTO account ${db(a)} RETURNING id`)[0];
        a.id = id;
    }

    for (const p of products) {
        await db`
        INSERT INTO product ${db(p)}
        `;
    }

    // Add the admin to the database
    const hash = await Bun.password.hash(admin.password);
    await db`
    INSERT INTO admin (username, hash)
    VALUES (${admin.username}, ${hash})
    `;
    const login = await request(app)
        .post("/api/login")
        .send({ ...admin });
    token = login.body.token;

});

afterAll(() => {
    console.log("Ending it");
    // db.end()
});

describe("Products with correct token", () => {

    test("get products", async () => {
        const response = await request(app)
            .get("/api/product")
            .expect(200);
        const body: unknown[] = response.body;
        expect(body).toBeArray();
        const fetchedProducts = body.map(p => toNewProduct(p));
        expect(response.body).toEqual(products);
        for (const p of fetchedProducts) {
            const found = fetchedProducts.find(x => x.name === p.name);
            expect(found).toBeDefined();
            expect(found).toEqual(p);
        }
    });

    test("add new products", async () => {
        const newProductAmount = 6;
        const newProducts = [
            ...new Map(Array.from({ length: newProductAmount }, () => createRandomProduct(faker.food.ingredient()))
                .map(acc => [acc.name, acc])
            ).values()
        ];
        for (const newProduct of newProducts) {
            // Add the new drink
            await request(app)
                .post("/api/product")
                .set("Authorization", "Bearer " + token)
                .send(newProduct)
                .expect(200);

            const response = await request(app)
                .get("/api/product")
                .expect(200);

            expect(response.body).toContainEqual(newProduct);
        }
        const response = await request(app)
            .get("/api/product")
            .expect(200);
        const body: unknown[] = response.body;
        expect(body).toBeArray();
        const fetchedProducts: Product[] = body.map(p => toNewProduct(p));
        for (const p of newProducts) {
            expect(fetchedProducts).toContainEqual(p);
        }
    });

    test("update values of a drink", async () => {
        // Will the previous test affect this?
        const priceChange = 150;
        const updatedProducts: Product[] = products.map(p =>
        ({
            ...p,
            newName: faker.food.ingredient(),
            pricein: p.pricein + priceChange,
            priceout: p.priceout + priceChange,
            color: faker.helpers.arrayElement(Object.values(Color))
        })
        );
        for (const updatedProduct of updatedProducts) {
            await request(app)
                .put("/api/product")
                .set("Authorization", "Bearer " + token)
                .send(updatedProduct)
                .expect(201);
        }
        const response = await request(app)
            .get("/api/product")
            .expect(200);

        const body: unknown[] = response.body;
        expect(body).toBeArray();
        const fetchedProducts: Product[] = body.map(p => toNewProduct(p));

        // Check updated products exist
        for (const p of updatedProducts) {
            const found = fetchedProducts.find(x => x.name === p.newName);
            expect(found).toBeDefined();
            if (p && p.name) {
                p.name = p.newName!;
                delete p.newName;
            }
            expect(found).toEqual(p);
        }
        for (const p of products) {
            expect(fetchedProducts).not.toContainEqual(p);
        }
    });

    test("delete a drink", async () => {
        for (const [i, p] of products.entries()) {
            const productName = encodeURIComponent(p.name);

            await request(app)
                .delete("/api/product/" + productName)
                .set("Authorization", "Bearer " + token)
                .expect(204);

            const response = await request(app)
                .get("/api/product")
                .expect(200);
            const body: unknown[] = response.body;
            expect(body).toBeArray();
            const fetchedProducts = body.map(p => toNewProduct(p));
            expect(fetchedProducts).not.toContainEqual(p);
            expect(fetchedProducts).toHaveLength(products.length - (i + 1));

        }

    });
});
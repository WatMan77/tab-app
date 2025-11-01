import express from "express"
import { db } from "../database"
import type { Product } from '../types'
import { cleanRedisProducts, toNewProduct } from '../utils'
import { validateToken } from "../middlewares";
import { redisClient } from "../utils";

const router = express.Router();
const CACHE_PRODUCTS = "products";

router.get("/", async (_req, res) => {
    try {
        /*const cached = await redisClient.get(CACHE_PRODUCTS);
        if (cached) {
            return res.status(200).send(JSON.parse(cached))
        }*/
        const products = await db`SELECT * FROM product;`
        await redisClient.set(CACHE_PRODUCTS, JSON.stringify(products))
        res.status(200).send(products)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post("/", validateToken, async (req, res) => {
    try {
        const product: Product = toNewProduct(req.body)
        await db`
        INSERT INTO product (name, pricein, priceout, color)
        VALUES (${product.name}, ${product.pricein.toFixed(0)}, ${product.priceout.toFixed(0)}, ${product.color})
        RETURNING *
        `;
        await cleanRedisProducts()
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.put("/", validateToken, async (req, res) => {
    try {
        const product: Product = toNewProduct(req.body);
        const newName = req.body.newName
        if (!newName || typeof newName !== 'string') {
            return res.status(401).json({ error: "No new name found" })
        }
        await db`
        UPDATE product 
        SET name = ${newName}, 
            pricein = ${product.pricein.toFixed(0)}, 
            priceout = ${product.priceout.toFixed(0)}, 
            color = ${product.color}
        WHERE name = ${product.name}
        `;
        await cleanRedisProducts()
        res.status(201).send("OK");
    } catch (e) {
        console.log(e)
        res.status(401).json({ error: e })
    }
})

router.delete("/:name", validateToken, async (req, res) => {
    try {
        const params = req.params
        const name: string = decodeURIComponent(params['name'] ?? "");

        if (!name || name.length == 0) {
            return res.status(400).json({ error: "'name' not found" })
        }
        await db`DELETE FROM product WHERE name=${name}`;
        await cleanRedisProducts()

        res.status(204).send("Delete successful");
    } catch (e) {
        console.log("Deletion failed", e)
    }
})

export { router as productRouter }
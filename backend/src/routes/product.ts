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
        const cached = await redisClient.get(CACHE_PRODUCTS);
        if (cached) {
            return res.status(200).send(JSON.parse(cached))
        }
        const products: Product[] = (await db.query("SELECT * FROM product;")).rows
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
        await db.query("INSERT INTO product (name, pricein, priceout, color) VALUES($1, $2, $3, $4) RETURNING *", [product.name, product.pricein.toFixed(0), product.priceout.toFixed(0), product.color])
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
        await db.query("UPDATE product SET name=$1, pricein=$2, priceout=$3, color=$4 WHERE name=$5;", [newName, product.pricein.toFixed(0), product.priceout.toFixed(0), product.color, product.name])
        await cleanRedisProducts()
        res.status(201).send("OK");
    } catch (e) {
        console.log(e)
        res.status(401).json({ error: e })
    }
})

router.delete("/:name", validateToken, async (req, res) => {
    try {
        const { name } = req.params
        if (!name) {
            return res.status(400).json({ error: "'name' not found" })
        }
        await db.query("DELETE FROM product WHERE name=$1;", [name]);
        await cleanRedisProducts()

        res.status(204).send("Delete successful");
    } catch (e) {
        console.log("Deletion failed", e)
    }
})

export { router as productRouter }
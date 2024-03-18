import express from "express"
import { db } from "../database"
import { Product } from '../types'
import { toNewProduct } from '../utils'

const jwt = require("jsonwebtoken")

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const products: Product[] = (await db.query("SELECT * FROM product;")).rows
        res.status(200).send(products)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post("/", async (req, res) => {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }

        const product: Product = toNewProduct(req.body)
        await db.query("INSERT INTO product (name, pricein, priceout) VALUES($1, $2, $3) RETURNING *", [product.name, product.pricein, product.priceout])
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.put("/", async (req, res) => {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }

        const product: Product = toNewProduct(req.body);
        const newName = req.body.newName
        if (!newName || typeof newName !== 'string') {
            return res.status(401).json({ error: "No new name found" })
        }
        await db.query("UPDATE product SET name=$1, pricein=$2, priceout=$3 WHERE name=$4;", [newName, product.pricein, product.priceout, product.name])
        res.status(201).send("OK");
    } catch (e) {
        console.log(e)
        res.status(401).json({ error: e })
    }
})

router.delete("/", async (req, res) => {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }

        const id = req.body.id;
        if (!id) {
            return res.status(400).json({ error: "Id not found" })
        }
        await db.query("DELETE FROM product WHERE id=$1;", [id]);
        res.status(204).send("Delete successful")
    } catch (e) {

    }
})

export { router as productRouter }
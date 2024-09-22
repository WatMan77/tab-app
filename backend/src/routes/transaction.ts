import express from "express"
import { db } from "../database"
import type { Log, Transaction } from '../types';
import { toNewTransaction } from '../utils'


const router = express.Router();

router.get("/", async (_req, res) => {
    try {
        const transactions: Log[] = (await db.query("SELECT * FROM transaction;")).rows
        res.status(200).send(transactions)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get("/recent", async (_req, res) => {
    try {
        const transactions: Log[] = (await db.query("SELECT * FROM transaction ORDER BY transaction_date DESC limit 10")).rows;
        res.status(200).send(transactions)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post("/", async (req, res) => {
    /*
    * The object received is
    * {items: {product: Product, amount: number }[], users: Account[] }
    */

    try {
        const transactionPromises: Promise<any>[] = []
        const transaction: Transaction = toNewTransaction(req.body)

        transaction.users.forEach((user) => {
            transaction.items.forEach((item) => {
                const addTransaction = db.query(`
                        INSERT INTO transaction
                        (username, product_name, amount)
                        VALUES ($1, $2, $3) RETURNING *;`,
                    [user.username, item.product.name, item.amount.toString()]);
                transactionPromises.push(addTransaction)
            });
        });
        await Promise.all(transactionPromises)

        // Now update the balances
        transaction.users.forEach(async (user) => {
            // Get the total price of the products
            const cost: number = transaction.items.reduce((totalCost, item) => {
                return totalCost + item.amount * item.product.pricein
            }, 0)
            // Update the balances here
            await db.query(`
                UPDATE account SET balance=balance - $1 WHERE username=$2`, [cost.toFixed(0), user.username]);
        })
        res.status(200).send("OK")
    } catch (e) {
        console.log("Transaction failed")
        console.log(e)
        res.status(400).send(e)
    }
})

export { router as transactionRouter }
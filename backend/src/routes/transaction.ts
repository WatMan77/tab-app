import express from "express"
import { db } from "../database"
import type { Log, Transaction } from '../types';
import { toNewTransaction } from '../utils'


const router = express.Router();

router.get("/", async (_req, res) => {
    try {
        const query =
            `SELECT t.*, a.*
         FROM transaction AS t
         JOIN account a ON a.id=t.user_id
         ORDER BY transaction_date DESC;`;
        const transactions: Log[] = (await db.query(query)).rows
        res.status(200).send(transactions)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get("/recent", async (_req, res) => {
    try {
        const query = `SELECT t.*, a.*
         FROM transaction AS t
         JOIN account a ON a.id=t.user_id
         ORDER BY transaction_date DESC LIMIT 10;`
        const transactions: Log[] = (await db.query(query)).rows;
        res.status(200).send(transactions)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query =
            `SELECT t.*, a.*
         FROM transaction AS t
         JOIN account a ON a.id=t.user_id
         WHERE a.id=$1
         ORDER BY transaction_date DESC;`;
        const transactions: Log[] = (await db.query(query, [id])).rows;
        res.status(200).send(transactions);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
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
                const sum = (item.amount * item.product.pricein).toFixed(0);
                const addTransaction = db.query(`
                        INSERT INTO transaction
                        (user_id, product_name, amount, sum)
                        VALUES ($1, $2, $3, $4) RETURNING *;`,
                    [user.id!.toString(), item.product.name, item.amount.toString(), sum]);
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
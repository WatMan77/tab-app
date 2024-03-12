import express from "express"
import { db } from "../database"
import { Transaction } from '../types'
import { toNewTransaction } from '../utils'


const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const transactions: Transaction[] = (await db.query("SELECT * FROM transaction;")).rows
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
        // Check user ID's and product ids again!

        transaction.users.forEach((user) => {
            transaction.items.forEach((item) => {
                const addTransaction = db.query(`
                        INSERT INTO transaction
                        (account_id, username, product_id, product_name, amount)
                        VALUES($1, 
                            (SELECT username FROM account WHERE id = $1),
                            $2,
                            (SELECT name FROM product WHERE id = $2), 
                            $3) RETURNING *;`, [user.id, item.product.id, item.amount]);
                transactionPromises.push(addTransaction)
            });
        });
        await Promise.all(transactionPromises)

        const balancePromises: Promise<any>[] = []

        // Now update the balances
        transaction.users.forEach((user) => {
            // Get the total price of the products
            const cost: number = transaction.items.reduce((totalCost, item) => {
                return totalCost + item.amount * item.product.pricein
            }, 0)
            transaction.items.forEach((item) => {
                const setAmount = db.query(`
                UPDATE account SET balance=balance - $1 WHERE id=$2`, [cost, user.id]);
                balancePromises.push(setAmount);
            })
        })
        await Promise.all(balancePromises)
        res.status(200).send("OK")
    } catch (e) {
        console.log("Transaction failed")
        console.log(e)
        res.status(400).send(e)
    }
})

export { router as transactionRouter }
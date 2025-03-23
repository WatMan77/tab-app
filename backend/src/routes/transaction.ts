import express from "express"
import { db } from "../database"
import type { Log, Transaction } from '../types';
import { toNewTransaction } from '../utils'
import bcrypt from "bcrypt";


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
        const transaction: Transaction = toNewTransaction(req.body)
        const totalCost: number = transaction.items.reduce((totalCost, item) => {
            return totalCost + item.amount * item.product.pricein
        }, 0)
        let errorList: string[] = [];

        for (const user of transaction.users) {
            const pinHash = (await db.query("SELECT pincode FROM account WHERE id=$1", [user.id!])).rows
            if (pinHash.length == 1 && pinHash[0].pincode !== null) {
                if (!bcrypt.compareSync(user.pincode ?? "", pinHash[0].pincode)) {
                    errorList.push("Wrong pincode for " + user.username)
                    continue;
                }
            }
            for (const item of transaction.items) {
                const sum = (item.amount * item.product.pricein).toFixed(0);
                await db.query(
                    `
                    INSERT INTO transaction
                    (user_id, product_name, amount, sum)
                    VALUES ($1, $2, $3, $4) RETURNING *;
                    `,
                    [user.id!.toString(), item.product.name, item.amount.toString(), sum]
                );
            }
            await db.query(`
                UPDATE account SET balance=balance - $1 WHERE username=$2`, [totalCost.toFixed(0), user.username]);
        }
        if (errorList.length > 0 && errorList.length !== transaction.users.length) {
            return res.status(207).send(errorList)
        }
        if (errorList.length > 0 && errorList.length === transaction.users.length) {
            return res.status(400).send(errorList)
        }

        return res.status(200).send("OK")
    } catch (e) {
        console.log("Transaction failed")
        console.log(e)
        res.status(400).send(e)
    }

})

export { router as transactionRouter }
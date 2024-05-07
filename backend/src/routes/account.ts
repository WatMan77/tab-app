import express from 'express';
import { db } from "../database"
import type { Account } from '../types';
import { toNewAccount } from '../utils'

const router = express.Router();

router.get("/transactions", async (_req, res) => {
    try {
        // Get all users with their most recent transaction.
        // Leaves blank transaction if user has not done it earlier.
        const accounts: Account[] = (await db.query(`
        SELECT u.*, MAX(t.transaction_date) AS recent
        FROM account AS u
        LEFT JOIN transaction t ON u.username=t.username
        GROUP BY u.username, u.category, u.balance, u.closed
        ORDER BY recent DESC;`)).rows
        res.status(200).send(accounts)
    } catch (e) {
        console.log(e)
    }
})

router.get("/", async (_req, res) => {
    try {
        const accounts: Account[] = (await db.query("SELECT * FROM account;")).rows
        res.status(200).send(accounts)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post("/", async (req, res) => {
    try {
        const account: Account = toNewAccount(req.body)
        console.log("Received account:")
        console.log("Account")
        await db.query("INSERT INTO account (username, category) VALUES($1, $2) RETURNING id, balance", [account.username, account.category])
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
});


export { router as accountRouter } 
import express from 'express';
import { db } from "../database"
import type { Account } from '../types';
import { toNewAccount } from '../utils';
import jwt from "jsonwebtoken";


const router = express.Router();

router.get("/transactions", async (_req, res) => {
    try {
        // Get all users with their most recent transaction.
        // Leaves blank transaction if user has not done it earlier.
        const accounts: Account[] = (await db.query(`
        SELECT u.*, MAX(t.transaction_date) AS recent
        FROM account AS u
        LEFT JOIN transaction t ON u.id=t.user_id
        GROUP BY u.username, u.category, u.balance, u.closed, u.id
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

router.delete("/", async (req, res) => {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env["SECRET"]!)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }

        await db.query("DELETE FROM account WHERE id=$1;", [req.body.id]);

        return res.status(200).send("User deleted successfully");

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})


export { router as accountRouter } 
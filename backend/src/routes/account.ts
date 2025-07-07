import express from 'express';
import { db } from "../database"
import type { Account } from '../types';
import { toNewAccount } from '../utils';
import { validateToken } from '../middlewares';
import bcrypt from "bcrypt";

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
        await db.query("INSERT INTO account (username, category) VALUES($1, $2) RETURNING id, balance", [account.username, account.category])
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
});

router.delete("/", validateToken, async (req, res) => {
    try {
        await db.query("DELETE FROM account WHERE id=$1;", [req.body.id]);

        return res.status(200).send("User deleted successfully");

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
});

router.patch("/unlockUntil", async (req, res) => {
    try {
        const body: { id: number; pincode: string; unlocked_until: string } = req.body;
        const hash = await db.query("SELECT pincode FROM account WHERE id=$1", [body.id]);
        const correctPin = bcrypt.compareSync(body.pincode, hash.rows[0].pincode)
        if (!correctPin) {
            return res.status(401).send("Incorrect pincode")
        }
        await db.query("UPDATE account SET unlocked_until=$1 WHERE id=$2", [body.unlocked_until.toString(), body.id.toString()])
        return res.status(204).end();
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get("/stats", validateToken, async (_req, res) => {

    try {
        const accounts = await db.query("SELECT username, balance, closed FROM account ORDER BY username ASC;");
        return res.status(200).send(accounts.rows);
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})


export { router as accountRouter } 
import express from 'express';
import { db } from "../database"
import type { Account } from '../types';
import { cleanRedisAccounts, toNewAccount } from '../utils';
import { validateToken } from '../middlewares';
import bcrypt from "bcrypt";
import { redisClient } from '../utils';
const router = express.Router();

const CACHE_ACCOUNT_TRANSACTIONS = "accounts:transactions";
const CACHE_ACCOUNTS = "accounts";

router.get("/transactions", async (_req, res) => {
    try {

        const cached = await redisClient.get(CACHE_ACCOUNT_TRANSACTIONS);
        if (cached) {
            return res.status(200).send(JSON.parse(cached))
        }
        // Get all users with their most recent transaction.
        // Leaves blank transaction if user has not done it earlier.
        const accounts = await db`
        SELECT u.*, MAX(t.transaction_date) AS recent
        FROM account AS u
        LEFT JOIN transaction t ON u.id = t.user_id
        GROUP BY u.username, u.category, u.balance, u.closed, u.id
        ORDER BY recent DESC
        `;

        await redisClient.setEx(CACHE_ACCOUNT_TRANSACTIONS, 600, JSON.stringify(accounts))

        res.status(200).send(accounts)
    } catch (e) {
        console.log(e)
    }
})

router.get("/", async (_req, res) => {
    try {
        const cached = await redisClient.get(CACHE_ACCOUNTS)
        if (cached) {
            return res.status(200).send(JSON.parse(cached))
        }
        const accounts: Account[] = await db`SELECT * FROM account`;

        await redisClient.setEx(CACHE_ACCOUNTS, 600, JSON.stringify(accounts))
        res.status(200).send(accounts)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post("/", async (req, res) => {
    try {
        const account: Account = toNewAccount(req.body)
        await db`
        INSERT INTO account (username, category, balance)
        VALUES (${account.username}, ${account.category}, ${Math.floor(account.balance!).toString()})
        RETURNING id, balance
        `;
        await cleanRedisAccounts()
        res.status(201).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
});

router.delete("/:id", validateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db`
        DELETE FROM account
        WHERE id = ${id}
        `;
        await redisClient.del(CACHE_ACCOUNT_TRANSACTIONS)
        await redisClient.del(CACHE_ACCOUNTS)

        return res.status(200).send("User deleted successfully");

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
});

router.patch("/unlockUntil", async (req, res) => {
    try {
        const body: { id: number; pincode: string; unlocked_until: string } = req.body;
        const hash = (await db`
        SELECT pincode
        FROM account
        WHERE id = ${body.id}
        `)[0];
        const correctPin = bcrypt.compareSync(body.pincode, hash[0][0].pincode)
        if (!correctPin) {
            return res.status(401).send("Incorrect pincode")
        }
        await db`
        UPDATE account
        SET unlocked_until = ${body.unlocked_until.toString()}
        WHERE id = ${body.id.toString()}
        `;

        await cleanRedisAccounts()

        return res.status(204).end();
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get("/stats", validateToken, async (_req, res) => {

    try {
        const accounts = (await db`
        SELECT username, balance, closed
        FROM account
        ORDER BY username ASC
        `)[0];
        return res.status(200).send(accounts[0]);
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})


export { router as accountRouter } 
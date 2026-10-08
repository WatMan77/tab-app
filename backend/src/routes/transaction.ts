import express from "express";
import { db } from "../database";
import type { Log, LogInformation, Transaction } from '@app/common';
import { cleanRedisAccounts, toNewTransaction } from '../utils';

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query["page"]?.toString() ?? "") || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        const transactions: Log[] =
            await db`SELECT t.*, a.*
         FROM transaction AS t
         JOIN account a ON a.id=t.user_id
         ORDER BY transaction_date DESC
         OFFSET ${offset}
         LIMIT ${limit};`;
        const count = await db`SELECT COUNT(*) FROM transaction;`;
        const returnObj: LogInformation = {
            count: Number.parseInt(count[0].count),
            logs: transactions
        };
        res.status(200).send(returnObj);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.get("/recent", async (_req, res) => {
    try {
        const query = `SELECT t.*, a.*
         FROM transaction AS t
         JOIN account a ON a.id=t.user_id
         ORDER BY transaction_date DESC LIMIT 10;`;
        const transactions: Log[] = (await db(query))[0];
        res.status(200).send(transactions);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const page = parseInt(req.query["page"]?.toString() ?? "") || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        const transactions: Log[] =
            (await db`SELECT t.*, a.*
         FROM transaction AS t
         JOIN account a ON a.id=t.user_id
         WHERE a.id=${id}
         ORDER BY transaction_date DESC
         OFFSET ${offset}
         LIMIT ${limit};`);
        const count = await db`SELECT COUNT(*) from transaction WHERE user_id=${id};`;
        const returnObj: LogInformation = {
            count: Number.parseInt(count[0].count),
            logs: transactions
        };
        res.status(200).send(returnObj);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post("/", async (req, res) => {
    /*
    * The object received is
    * { items: { name: string, amount: number }[], users: Account[], other?: number }
    *
    * Prices are NOT taken from the request. They used to be, which meant an unauthenticated
    * caller could name its own pricein and credit or debit any account by any amount.
    */

    try {
        const transaction: Transaction = toNewTransaction(req.body);
        const normalize = (date: Date) => new Date(Math.floor(date.getTime() / 1000) * 1000);

        // The product table is small, so one read is cheaper than a query per item.
        const priced = await db`SELECT name, pricein FROM product`;
        const prices = new Map<string, number>(
            priced.map((p: { name: string; pricein: number }) => [p.name, p.pricein])
        );

        const unknown = transaction.items
            .map((item) => item.name)
            .filter((name) => !prices.has(name));
        if (unknown.length > 0) {
            return res.status(400).send("Unknown product: " + unknown.join(", "));
        }

        // The free "Muu määrä" amount is the only figure the client supplies. toNewTransaction has
        // already checked it is a non-negative integer.
        const other = transaction.other ?? 0;

        const lines = transaction.items.map((item) => ({
            name: item.name,
            amount: item.amount,
            sum: item.amount * prices.get(item.name)!,
        }));
        if (other > 0) {
            lines.push({ name: "MUU", amount: 1, sum: other });
        }

        // Derived from the same per-line sums that get written, so the ledger rows always add up
        // to the balance change.
        const totalCost: number = lines.reduce((total, line) => total + line.sum, 0);
        const errorList: string[] = [];
        // Both account caches, not just this one: GET /api/account is cached under its own
        // key for 600 s, so the admin Balances page would show pre-purchase balances
        await cleanRedisAccounts();


        for (const user of transaction.users) {
            const accountInfo = (await db`
                SELECT pincode, unlocked_until
                FROM account
                WHERE id = ${user.id!}
                `);
            // Pincode required only if unlocked_until has passed
            const account = accountInfo[0];
            const needsPincode =
                account.unlocked_until && account.unlocked_until !== null &&
                account.pincode && account.pincode !== null &&
                normalize(new Date(account.unlocked_until)) < normalize(new Date());

            if (needsPincode) {
                if (!Bun.password.verifySync(user.pincode ?? "", accountInfo[0].pincode)) {
                    errorList.push("Wrong pincode for " + user.username);
                    continue;
                }
            }
            for (const line of lines) {
                await db`
                    INSERT INTO transaction (user_id, product_name, amount, sum)
                    VALUES (${user.id!.toString()}, ${line.name}, ${line.amount.toString()}, ${line.sum.toFixed(0)})
                    RETURNING *
                    `;
            }
            // Keyed on id, like the pin lookup above. Keying this on username meant a renamed or
            // stale username matched zero rows: the transaction rows were still written, nothing
            // was charged, and the handler returned 200.
            await db`
            UPDATE account
            SET balance = balance - ${totalCost.toFixed(0)}
            WHERE id = ${user.id!.toString()}
            `;
        }
        if (errorList.length > 0 && errorList.length !== transaction.users.length) {
            return res.status(207).send(errorList);
        }
        if (errorList.length > 0 && errorList.length === transaction.users.length) {
            console.log(errorList);
            return res.status(400).send(errorList);
        }

        return res.status(200).send("OK");
    } catch (e) {
        console.log("Transaction failed");
        console.log(e);
        res.status(400).send(e);
    }

});

export { router as transactionRouter };
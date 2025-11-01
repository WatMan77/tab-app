import express from "express"
import { db } from "../database"
import { cleanRedisAccounts, toNewAccount } from "../utils";
import { validateToken } from "../middlewares";

const router = express.Router();

router.put("/", validateToken, async (req, res) => {
    const account = req.body;
    try {
        const confirmedAccount = toNewAccount(account);
        const status: string = (!confirmedAccount.closed).toString()
        await db`
        UPDATE account
        SET closed = ${status}
        WHERE username = ${confirmedAccount.username}
        `;
        await cleanRedisAccounts()
        res.status(201).send("OK")
    } catch (e) {
        res.status(401).send("Changing piikki status failed: " + e)
    }
})

export { router as closeRouter }
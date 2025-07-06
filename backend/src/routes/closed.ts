import express from "express"
import { db } from "../database"
import { cleanRedisAccounts, toNewAccount } from "../utils";
import { validateToken } from "../middlewares";

const router = express.Router();

router.put("/", validateToken, async (req, res) => {
    const { account } = req.body;
    try {
        const confirmedAccount = toNewAccount(account);
        const status: string = (!confirmedAccount.closed).toString()
        await db.query("UPDATE account SET closed=$1 WHERE username=$2", [status, confirmedAccount.username])
        await cleanRedisAccounts()
        res.status(201).send("OK")
    } catch (e) {
        res.status(401).send("Updating status failed")
    }
})

export { router as closeRouter }
import express from "express"
import { db } from "../database"
import type { Account } from "../types";
import { toNewAccount } from "../utils";
import jwt from "jsonwebtoken"

const router = express.Router();

router.put("/", async (req, res) => {


    const { accounts } = req.body
    try {
        const confirmedAccounts: Account[] = accounts.map((o: unknown) => toNewAccount(o))
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env["SECRET"]!)
        if (!decodedToken) {
            return res.status(401).json({ error: 'token invalid' })
        }
        const updatePromises: Promise<any>[] = []


        confirmedAccounts.forEach(async a => {
            const query = db.query("UPDATE account SET balance=$1 WHERE username=$2;", [a.balance!.toString(), a.username])
            if (a.balance! <= -100 * 100) {
                await db.query("UPDATE account SET closed=true WHERE username=$1", [a.username])
            }
            updatePromises.push(query);
        })
        await Promise.all(updatePromises)
        res.status(201).send("OK")
    } catch (e) {
        res.status(401).send({ error: "Error in updating balances" })
    }
})

export { router as balanceRouter }
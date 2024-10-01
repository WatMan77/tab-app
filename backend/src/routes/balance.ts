import express from "express"
import { db } from "../database"
import type { UpdateAccount } from "../types";
import { toNewAccount } from "../utils";
import jwt from "jsonwebtoken"

const router = express.Router();

router.put("/", async (req, res) => {


    const { accounts } = req.body
    try {
        const confirmedAccounts: UpdateAccount[] = accounts.map((o: unknown) => toNewAccount(o))
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }
        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env["SECRET"]!)
        if (!decodedToken) {
            return res.status(401).json({ error: 'token invalid' })
        }

        confirmedAccounts.forEach(async a => {
            await db.query("UPDATE account SET balance=$1, category=$2 WHERE id=$3;", [a.balance!.toFixed(0), a.newCategory, a.id.toFixed(0)])

            // You must change the name the last
            if (a.newName && a.newName.trim() !== "") {
                await db.query("UPDATE account SET username=$1 WHERE id=$2", [a.newName, a.id.toFixed(0)])
            }
        })
        res.status(201).send("OK")
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: "Error in updating balances" })
    }
})

export { router as balanceRouter }
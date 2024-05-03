import express from "express"
import { db } from "../database"
import jwt from "jsonwebtoken"
import { toNewAccount } from "../utils";
const router = express.Router();


router.put("/", async (req, res) => {
    const { account } = req.body;
    try {
        const confirmedAccount = toNewAccount(account)
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env["SECRET"]!)
        if (!decodedToken) {
            return res.status(401).json({ error: 'token invalid' })
        }
        const status: string = (!confirmedAccount.closed).toString()
        await db.query("UPDATE account SET closed=$1 WHERE username=$2", [status, confirmedAccount.username])
        res.status(201).send("OK")
    } catch (e) {
        res.status(401).send("Updating status failed")
    }
})

export { router as closeRouter }
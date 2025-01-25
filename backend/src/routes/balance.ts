import express from "express"
import { db } from "../database"
import type { UpdateAccount } from "../types";
import { toNewAccount } from "../utils";
import { validateToken } from "../middlewares";

const router = express.Router();

router.put("/", validateToken, async (req, res) => {

    const { accounts } = req.body
    try {
        const confirmedAccounts: UpdateAccount[] = accounts.map((o: unknown) => toNewAccount(o))

        confirmedAccounts.forEach(async a => {
            await db.query("UPDATE account SET balance=$1, category=$2 WHERE id=$3;", [a.balance!.toFixed(0), a.newCategory, a.id.toString()])

            // Insert the change into admin_change
            await db.query("INSERT INTO admin_change (change, id) VALUES ($1, $2)", [a.change!.toFixed(0), a.id.toString()]);

            // You must change the name the last
            if (a.newName && a.newName.trim() !== "") {
                await db.query("UPDATE account SET username=$1 WHERE id=$2", [a.newName, a.id.toFixed(0)])
            }
        });
        res.status(201).send("OK")
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: "Error in updating balances" })
    }
})

export { router as balanceRouter }
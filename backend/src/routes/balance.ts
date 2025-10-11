import express from "express"
import { db } from "../database"
import type { UpdateAccount } from "../types";
import { cleanRedisAccounts, cleanRedisChange, toNewAccount } from "../utils";
import { validateToken } from "../middlewares";
import bcrypt from "bcrypt";


const router = express.Router();

router.put("/", validateToken, async (req, res) => {

    const { accounts } = req.body
    try {
        const confirmedAccounts: UpdateAccount[] = accounts.map((o: unknown) => toNewAccount(o))
        for (const a of confirmedAccounts) {
            await db.query("UPDATE account SET balance=$1, category=$2 WHERE id=$3;", [a.balance!.toFixed(0), a.newCategory, a.id.toString()])
            if (a.pincode) {
                console.log("Updating pin: ", a.pincode, a.unlocked_until)
                const hash = await bcrypt.hash(a.pincode!, 10)
                await db.query("UPDATE account SET pincode=$1, unlocked_until=$2 WHERE id=$3;", [hash, new Date().toISOString(), a.id.toString()])
            }

            // Insert the change into admin_change
            if (a.change && a.change?.toFixed(0) !== "0") {
                await db.query("INSERT INTO admin_change (change, id) VALUES ($1, $2)", [a.change!.toFixed(0), a.id.toString()]);
            }

            // You must change the name the last
            if (a.newName && a.newName.trim() !== "") {
                await db.query("UPDATE account SET username=$1 WHERE id=$2", [a.newName, a.id.toString()])
            }
        };
        await cleanRedisAccounts()
        await cleanRedisChange()
        res.status(201).send("OK")
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: "Error in updating balances" })
    }
})

export { router as balanceRouter }
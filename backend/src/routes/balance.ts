import express from "express";
import { db } from "../database";
import type { UpdateAccount } from "@app/common";
import { cleanRedisAccounts, cleanRedisChange, toNewAccount } from "../utils";
import { validateToken } from "../middlewares";


const router = express.Router();

router.put("/", validateToken, async (req, res) => {

    const { accounts } = req.body;
    try {
        const confirmedAccounts: UpdateAccount[] = accounts.map((o: unknown) => toNewAccount(o));
        for (const a of confirmedAccounts) {
            await db`UPDATE account SET balance = ${a.balance!.toFixed(0)} WHERE id = ${a.id!.toString()}`;

            if (a.pincode) {
                const hash = await Bun.password.hash(a.pincode);
                await db`UPDATE account SET pincode = ${hash}, unlocked_until = ${new Date().toISOString()} WHERE id = ${a.id!.toString()}`;
            }

            // Insert the change into admin_change
            if (a.change && a.change?.toFixed(0) !== "0") {
                await db`
                INSERT INTO admin_change (change, id)
                VALUES (${a.change.toFixed(0)}, ${a.id!.toString()})
                `;
            }

            // You must change the name the last
            if (a.newName && a.newName.trim() !== "") {
                await db`UPDATE account SET username = ${a.newName} WHERE id = ${a.id!.toString()}`;
            }
        };
        await cleanRedisAccounts();
        await cleanRedisChange();
        res.status(201).send("OK");
    } catch (e) {
        console.log(e);
        res.status(401).send({ error: "Error in updating balances" });
    }
});

export { router as balanceRouter };
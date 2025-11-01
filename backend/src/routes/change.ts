import express from "express"
import { db } from "../database"
import { redisClient } from "../utils";

const router = express.Router();
const CACHE_CHANGE = "change";

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const changes = await db`
        SELECT change_date, change, username
        FROM admin_change
        JOIN account ON admin_change.id = account.id
        WHERE account.id = ${id}
        ORDER BY change_date DESC
        `;
        res.status(200).send(changes[0])

    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/", async (_req, res) => {
    try {
        const cached = await redisClient.get(CACHE_CHANGE);
        if (cached) {
            return res.status(200).send(JSON.parse(cached))
        }
        const changes = (await db`
        SELECT change_date, change, username
        FROM admin_change
        JOIN account ON admin_change.id = account.id
        ORDER BY change_date DESC
        `);
        await redisClient.set(CACHE_CHANGE, JSON.stringify(changes))
        res.status(200).send(changes);
    } catch (e) {
        res.status(400).send(e)
    }

});


export { router as changeRouter }
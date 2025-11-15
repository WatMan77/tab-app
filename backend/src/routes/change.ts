import express from "express"
import { db } from "../database"
import { redisClient } from "../utils";

const router = express.Router();
const CACHE_CHANGE = "change";

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const page = parseInt(req.query["page"]?.toString() ?? "") || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        const changes = await db`
        SELECT change_date, change, username
        FROM admin_change
        JOIN account ON admin_change.id = account.id
        WHERE account.id = ${id}
        ORDER BY change_date DESC
        OFFSET ${offset}
        LIMIT ${limit};`;
        const count = await db`SELECT COUNT(*) AS count FROM admin_change WHERE id=${id};`
        const returnObj = {
            count: count[0].count,
            changes
        }
        res.status(200).send(returnObj)

    } catch (e) {
        res.status(400).send(e)
        console.error(e)
    }
})

router.get("/", async (req, res) => {
    try {
        // const cached = await redisClient.get(CACHE_CHANGE);
        // if (cached) {
        //     return res.status(200).send(JSON.parse(cached))
        // }
        const page = parseInt(req.query["page"]?.toString() ?? "") || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        const changes = (await db`
        SELECT change_date, change, username
        FROM admin_change
        JOIN account ON admin_change.id = account.id
        ORDER BY change_date DESC
        OFFSET ${offset}
        LIMIT ${limit}
        `);
        const count = await db`SELECT COUNT(*) FROM admin_change;`
        const returnObj = {
            count: count[0].count,
            changes

        }
        await redisClient.set(CACHE_CHANGE, JSON.stringify(returnObj))
        res.status(200).send(returnObj);
    } catch (e) {
        res.status(400).send(e)
        console.error(e)
    }

});


export { router as changeRouter }
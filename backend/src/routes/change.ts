import express from "express"
import { db } from "../database"

const router = express.Router();

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const changes = await db.query(`
            
        SELECT change_date, change, username
        FROM admin_change
        JOIN account ON admin_change.id=account.id
        WHERE account.id=$1
        ORDER BY change_date DESC
        `, [id])
        res.status(200).send(changes.rows)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/", async (_req, res) => {
    try {
        const changes = await db.query(
            `
        SELECT change_date, change, username
        FROM admin_change
        JOIN account ON admin_change.id=account.id
        ORDER BY change_date DESC
        ;`)
        res.status(200).send(changes.rows);
    } catch (e) {
        res.status(400).send(e)
    }

});


export { router as changeRouter }
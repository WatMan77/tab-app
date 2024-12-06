import express from "express"
import { db } from "../database"

const router = express.Router();

router.get("/", async (_req, res) => {
    const changes = await db.query(
        `
        SELECT change_date, change, username
        FROM admin_change
        JOIN account ON admin_change.id=account.id
        ORDER BY change_date DESC
        ;`)
    res.status(200).send(changes.rows);
});

export { router as changeRouter }
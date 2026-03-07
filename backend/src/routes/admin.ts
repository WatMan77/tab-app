import express from "express";
import { db } from "../database";
import { requireAdminIfExists } from "../middlewares";

const router = express.Router();


router.post("/", requireAdminIfExists, async (req, res) => {
    try {
        const { username, password } = req.body;

        const passwordHash = await Bun.password.hash(password);

        await db`
        INSERT INTO admin (username, hash)
        VALUES (${username}, ${passwordHash})
        `;
        res.status(201).send("User created");
    } catch (e) {
        res.status(400).send("Error creating user " + e);
    }
});

router.get("/admin-check", async (_req, res) => {
    try {
        const adminStatus = await db`SELECT EXISTS (SELECT 1 FROM admin);`;
        return res.status(200).json({
            adminExists: adminStatus[0].exists
        })
    } catch (e) {
        res.status(400).send("Error checking admin " + e)
    }
})

export { router as adminRouter };
import express from "express"
import { db } from "../database"

const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const { username, password } = req.body

        const passwordHash = await Bun.password.hash(password);

        await db`
        INSERT INTO admin (username, hash)
        VALUES (${username}, ${passwordHash})
        `;
        res.status(201).send("User created")
    } catch (e) {
        res.status(400).send("Error creating user " + e)
    }
})

export { router as adminRouter }
import express from "express"
import { db } from "../database"
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const { username, password } = req.body

        // 10 is the "salt round"
        const passwordHash = await bcrypt.hash(password, 10);

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
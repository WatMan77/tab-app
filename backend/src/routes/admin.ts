import express from "express"
import { db } from "../database"
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const { username, password } = req.body


        // 10 is the "salt round"
        const passwordHash = await bcrypt.hash(password, 10);
        console.log("Password hash ", passwordHash)

        const query = await db.query("INSERT INTO admin (username, hash) VALUES ($1, $2)", [username, passwordHash])
        res.status(201).send("User created")
    } catch (e) {
        res.status(400).send("Error creating user " + e)
    }
})

export { router as adminRouter }
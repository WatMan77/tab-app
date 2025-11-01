import express from "express"
import { db } from "../database"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const { username, password } = req.body;
        const query: { username: string; hash: string } = (await db`
        SELECT *
        FROM admin
        WHERE username = ${username}
        `)[0];

        //Check the validity of the query.
        if (!query || !query.username || !query.hash) {
            res.status(401).json({ error: "Username or password is invalid" });
            return;
        }

        const checkPassword = await bcrypt.compare(password, query.hash)
        if (checkPassword) {
            const token = jwt.sign(username, process.env["SECRET"]!)
            res.status(200).send({ token })
        } else {
            res.status(401).json({ error: "Username or password is invalid" });
        }
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

export { router as loginRouter }
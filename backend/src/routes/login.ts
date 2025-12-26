import express from "express";
import { db } from "../database";
import jwt from "jsonwebtoken";

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
            return res.status(401).json({ error: "Username or password is invalid" });
        }

        // case 1: Is bcrypt
        if (query.hash.startsWith("$2")) {
            const checkPassword = await Bun.password.verify(password, query.hash);
            if (checkPassword) {
                // Change password to use argon2id
                const newHash = await Bun.password.hash(password);
                await db`UPDATE admin SET hash=${newHash};`;
                const token = jwt.sign(username, process.env["SECRET"]!);
                return res.status(200).send({ token });
            } else {
                return res.status(401).json({ error: "Username or password is invalid" });
            }
        }

        //case 2: argon2id
        const checkPassword = await Bun.password.verify(password, query.hash);
        if (!checkPassword) {
            return res.status(401).json({ error: "Username or password is invalid" });
        }
        const token = jwt.sign(username, process.env["SECRET"]!);
        return res.status(200).send({ token });

    } catch (e) {
        res.status(400).send(e);
        console.log(e);
    }
});

export { router as loginRouter };
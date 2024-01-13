import express from 'express';
import 'dotenv/config';
import { db } from "./src/database";
import { toNewAccount } from "./src/utils";
import { Account } from "./src/types";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM account;")
        console.log("Result?", result.rows);
    } catch (e) {
        console.log("Error", e)
    }
    res.send("Hello world!");
});

app.post("/account", async (req, res) => {
    try {
        const account: Account = toNewAccount(req.body)
        console.log("Received account:")
        console.log("Account")
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
    }
});

app.listen(PORT, () => {
    return console.log("Server running on port " + PORT);
});

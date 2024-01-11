import express from 'express';
import 'dotenv/config';
import { db } from "./src/database";

const app = express();

const port = 3000;

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM users;")
        console.log("Result?", result);
    } catch (e) {
        console.log("Error", e)
    }
    res.send("Hello world!");
});

app.listen(port, () => {
    return console.log("Server runningon port " + port);
});

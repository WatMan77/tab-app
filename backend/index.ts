import express from 'express';
import "express-async-errors";
import 'dotenv/config';
import { db, clearDatabase, initDb } from "./src/database";
import { redisClient, toNewAccount } from "./src/utils";
import type { Account } from "@app/common";
import { accountRouter } from "./src/routes/account";
import { productRouter } from "./src/routes/product";
import { transactionRouter } from "./src/routes/transaction";
import { adminRouter } from "./src/routes/admin";
import { loginRouter } from "./src/routes/login";
import { balanceRouter } from "./src/routes/balance";
import { closeRouter } from './src/routes/closed';
import { changeRouter } from './src/routes/change';
import * as testValues from "./tests/db_values";
import cors from "cors";
import './src/cron-jobs';
import { Server } from 'socket.io';
import { validateToken } from './src/middlewares';
import { createServer } from "http";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["*"],
        allowedHeaders: ["Content-Type"]
    }
});

app.use(express.json());
app.use(cors());

const PORT = process.env['PORT'] || 3000;

app.use("/api/account/closed", closeRouter);
app.use("/api/account", accountRouter);
app.use("/api/product", productRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/admin", adminRouter);
app.use("/api/login", loginRouter);
app.use("/api/balance", balanceRouter);
app.use("/api/changes", changeRouter);

if (Bun.env.NODE_ENV === "test" || Bun.env.NODE_ENV === "development") {
    app.delete("/api/reset", async (_req, res) => {
        await redisClient.flushAll();
        try {
            await initDb();
            await clearDatabase();
            res.status(204).send("OK");
        } catch (e) {
            console.log(e);
        }
    });
    app.get("/api/testadmin", async (_req, res) => {
        await redisClient.flushAll();

        try {
            const passwordHash = await Bun.password.hash("password123");
            await db`
            INSERT INTO admin (username, hash)
            VALUES (${"admin"}, ${passwordHash})
            `;

            res.status(201).send("OK");

        } catch (e) {
            console.log(e);
        }
    });

    app.get("/api/testdb", async (_req, res) => {
        await redisClient.flushAll();

        for (const a of testValues.accounts) {
            await db`
            INSERT INTO account (username, balance)
            VALUES (${a.username} ${a.balance!.toString()})
            `;
        }

        for (const p of testValues.products) {
            await db`
            INSERT INTO product (name, pricein, priceout, color)
            VALUES (${p.name}, ${p.pricein.toString()}, ${p.priceout.toString()}, ${p.color})
            `;
        }

        res.status(201).send("OK");
    });
    app.get("/api/health", async (_req, res) => {
        res.status(201).send("OK");
    });
}


// New user has been added
app.post("/api/newaccount", validateToken, async (req, res) => {
    try {
        const account: Account = toNewAccount(req.body);
        // There is a chance the amount has a decimal at the very end
        const balance = Math.floor(account.balance!);

        await db`
        INSERT INTO account (username, balance)
        VALUES (${account.username}, ${balance.toString()})
        `;
        res.status(201).send("OK");
    } catch (e) {
        res.status(400).send(e);
        console.log(e);
    }
});

if (Bun.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
        return console.log("Server running on port " + PORT);
    });
}


export default server;
export { io };
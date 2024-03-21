import express from 'express';
import "express-async-errors"
import 'dotenv/config';
import { db } from "./src/database";
import { toNewAccount } from "./src/utils";
import { Account } from "./src/types";
import { accountRouter } from "./src/routes/account"
import { productRouter } from "./src/routes/product"
import { transactionRouter } from "./src/routes/transaction"
import { adminRouter } from "./src/routes/admin"
import { loginRouter } from "./src/routes/login"
import { balanceRouter } from "./src/routes/balance"
import jwt from "jsonwebtoken"

const app = express();
import cors from "cors"

app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 3000;

app.use("/api/account", accountRouter)
app.use("/api/product", productRouter)
app.use("/api/transaction", transactionRouter)
app.use("/api/admin", adminRouter)
app.use("/api/login", loginRouter)
app.use("/api/balance", balanceRouter)


// New user has been added
app.post("/api/newaccount", async (req, res) => {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.SECRET!)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }
        // Token is ok. Now create the new user.
        const account: Account = toNewAccount(req.body)
        // There is a chance the amount has a decimal at the very end

        const balance = Math.floor(account.balance!)

        const query = await db.query("INSERT INTO account (username, category, balance) VALUES ($1, $2, $3)", [account.username, account.category, balance.toString()])
        res.status(201).send("OK")
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

app.listen(PORT, () => {
    return console.log("Server running on port " + PORT);
});

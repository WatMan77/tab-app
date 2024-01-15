import express from 'express';
import 'dotenv/config';
import { db } from "./src/database";
import { toNewAccount, toNewProduct, toNewTransaction } from "./src/utils";
import { Account, Product, Transaction } from "./src/types";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM account;")
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
        await db.query("INSERT INTO account (username, category) VALUES($1, $2) RETURNING id, balance", [account.username, account.category])
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
});

app.post("/product", async (req, res) => {
    try {
        const product: Product = toNewProduct(req.body)
        await db.query("INSERT INTO product (name, pricein, priceout) VALUES($1, $2, $3) RETURNING *", [product.name, product.pricein, product.priceout])
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

app.post("/transaction", async (req, res) => {
    try {
        const transaction: Transaction = toNewTransaction(req.body)
        await db.query(`
        INSERT INTO transaction
        (account_id, username, product_id, product_name, amount)
        VALUES($1, 
            (SELECT username FROM account WHERE id = $1),
            $2,
            (SELECT name FROM product WHERE id = $2), 
            $3) RETURNING *;`,
            [transaction.account_id, transaction.product_id, transaction.amount])
        res.status(200).send("OK")
    } catch (e) {
        console.log("Transaction failed")
        console.log(e)
        res.status(400).send(e)
    }
})

app.listen(PORT, () => {
    return console.log("Server running on port " + PORT);
});

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
        const result = await db.query("INSERT INTO account (username, category) VALUES($1, $2) RETURNING id, balance", [account.username, account.category])
        console.log("Result?", result.rows);
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
});

app.post("/product", async (req, res) => {
    try {
        const product: Product = toNewProduct(req.body)
        const result = await db.query("INSERT INTO product (name, pricein, priceout) VALUES($1, $2, $3) RETURNING *", [product.name, product.pricein, product.priceout])
        console.log("Product result?", result.rows)
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

app.post("/transaction", async (req, res) => {
    try {
        const transaction: Transaction = toNewTransaction(req.body)
        const result = await db.query(`
        INSERT INTO transcation
        (account_id, username, product_id, product_name, transaction_date, amount)
        VALUES($1, $2, $3, $4, $5, $6)`,
            [transaction.account_id, transaction.username, transaction.product_id, transaction.product_name, transaction.transaction_date, transaction.amount])
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

app.listen(PORT, () => {
    return console.log("Server running on port " + PORT);
});

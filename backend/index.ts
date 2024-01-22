import express from 'express';
require('express-async-errors')
import 'dotenv/config';
import { db } from "./src/database";
import { toNewAccount, toNewProduct, toNewTransaction } from "./src/utils";
import { Account, Product, Transaction } from "./src/types";
import { UserType } from './src/types';

const app = express();
const cors = require("cors")

app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    res.send("Hello world!");
});

app.get("/api/account", async (req, res) => {
    try {
        const accounts: Account[] = (await db.query("SELECT * FROM account;")).rows
        res.status(200).send(accounts)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

app.post("/api/account", async (req, res) => {
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

app.get("/api/product", async (req, res) => {
    try {
        const products: Product[] = (await db.query("SELECT * FROM product;")).rows
        res.status(200).send(products)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

app.post("/api/product", async (req, res) => {
    try {
        const product: Product = toNewProduct(req.body)
        await db.query("INSERT INTO product (name, pricein, priceout) VALUES($1, $2, $3) RETURNING *", [product.name, product.pricein, product.priceout])
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

app.get("/api/transaction", async (req, res) => {
    try {
        const transactions: Transaction[] = (await db.query("SELECT * FROM transaction;")).rows
        res.status(200).send(transactions)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

app.post("/api/transaction", async (req, res) => {
    /*
    * The object received is
    * {items: {product: Product, amount: number }[], users: Account[] }
    */

    try {
        const transactionPromises: Promise<any>[] = []
        const transaction: Transaction = toNewTransaction(req.body)
        // Check user ID's and product ids again!

        transaction.users.forEach((user) => {
            transaction.items.forEach((item) => {
                const addTransaction = db.query(`
                        INSERT INTO transaction
                        (account_id, username, product_id, product_name, amount)
                        VALUES($1, 
                            (SELECT username FROM account WHERE id = $1),
                            $2,
                            (SELECT name FROM product WHERE id = $2), 
                            $3) RETURNING *;`, [user.id, item.product.id, item.amount]);
                transactionPromises.push(addTransaction)
            });
        });
        await Promise.all(transactionPromises)

        const balancePromises: Promise<any>[] = []

        // Now update the balances
        transaction.users.forEach((user) => {
            // Get the total price of the products
            const cost: number = transaction.items.reduce((totalCost, item) => {
                return totalCost + item.amount * item.product.pricein
            }, 0)
            transaction.items.forEach((item) => {
                const setAmount = db.query(`
                UPDATE account SET balance=balance - $1 WHERE id=$2`, [cost, user.id]);
                balancePromises.push(setAmount);
            })
        })
        await Promise.all(balancePromises)
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

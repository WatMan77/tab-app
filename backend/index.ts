import express from 'express';
require('express-async-errors')
import 'dotenv/config';
import { db } from "./src/database";
import { toNewAccount, toNewProduct, toNewTransaction } from "./src/utils";
import { Account, Product, Transaction } from "./src/types";
import { UserType } from './src/types';
import bcrypt from "bcrypt";
const jwt = require("jsonwebtoken")

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
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }

        const product: Product = toNewProduct(req.body)
        await db.query("INSERT INTO product (name, pricein, priceout) VALUES($1, $2, $3) RETURNING *", [product.name, product.pricein, product.priceout])
        res.status(200).send("OK")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

app.put("/api/product", async (req, res) => {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }

        const product: Product = toNewProduct(req.body);
        await db.query("UPDATE product SET name=$1, pricein=$2, priceout=$3 WHERE id=$4;", [product.name, product.pricein, product.priceout, product.id!])
        res.status(201).send("OK");
    } catch (e) {
        console.log(e)
        res.status(401).json({ error: e })
    }
})

app.delete("/api/product", async (req, res) => {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }

        const id = req.body.id;
        if (!id) {
            return res.status(400).json({ error: "Id not found" })
        }
        await db.query("DELETE FROM product WHERE id=$1;", [id]);
        res.status(204).send("Delete successful")
    } catch (e) {

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

app.post("/api/admin", async (req, res) => {
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

app.post("/api/login", async (req, res) => {
    try {
        console.log("Body?", req.body)

        const { username, password } = req.body;
        const query: { username: string, hash: string } = (await db.query("SELECT * FROM admin WHERE username=$1", [username])).rows[0]

        //Check the validity of the query.
        if (!query || !query.username || !query.hash) {
            res.status(401).json({ error: "Username or password is invalid" });
            return;
        }

        const checkPassword = await bcrypt.compare(password, query.hash)
        if (checkPassword) {
            const token = jwt.sign(username, process.env.SECRET)
            res.status(200).send({ token })
        } else {
            res.status(401).json({ error: "Username or password is invalid" });
        }
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

// New user has been added
app.post("/api/newaccount", async (req, res) => {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }
        // Token is ok. Now create the new user.
        const account: Account = toNewAccount(req.body)
        // There is a chance the amount has a decimal at the very end

        const query = await db.query("INSERT INTO account (username, category, balance) VALUES ($1, $2, $3)", [account.username, account.category, Math.floor(account.balance!)])
        res.status(201).send("OK")
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

app.put("/api/balance", async (req, res) => {
    const { username, password } = req.body

    const { accounts } = req.body
    const confirmedAccounts: Account[] = accounts.map((o: unknown) => toNewAccount(o))
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" })
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken) {
            console.log("Token invalid!")
            return res.status(401).json({ error: 'token invalid' })
        }
        const updatePromises: Promise<any>[] = []

        confirmedAccounts.forEach(a => {
            const query = db.query("UPDATE account SET balance=$1 WHERE id=$2;", [a.balance!, a.id!])
            updatePromises.push(query);
        })
        await Promise.all(updatePromises)
        res.status(201).send("OK")
    } catch (e) {
        res.status(401).send({ error: "Error in updating balances" })
    }
})

app.listen(PORT, () => {
    return console.log("Server running on port " + PORT);
});

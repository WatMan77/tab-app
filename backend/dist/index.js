"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const database_1 = require("./src/database");
const utils_1 = require("./src/utils");
const app = (0, express_1.default)();
const cors = require("cors");
app.use(express_1.default.json());
app.use(cors());
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Hello world!");
}));
app.get("/api/account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = (yield database_1.db.query("SELECT * FROM account;")).rows;
        res.status(200).send(accounts);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
}));
app.post("/api/account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = (0, utils_1.toNewAccount)(req.body);
        console.log("Received account:");
        console.log("Account");
        yield database_1.db.query("INSERT INTO account (username, category) VALUES($1, $2) RETURNING id, balance", [account.username, account.category]);
        res.status(200).send("OK");
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
}));
app.get("/api/product", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = (yield database_1.db.query("SELECT * FROM product;")).rows;
        res.status(200).send(products);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
}));
app.post("/api/product", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = (0, utils_1.toNewProduct)(req.body);
        yield database_1.db.query("INSERT INTO product (name, pricein, priceout) VALUES($1, $2, $3) RETURNING *", [product.name, product.pricein, product.priceout]);
        res.status(200).send("OK");
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
}));
app.get("/api/transaction", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = (yield database_1.db.query("SELECT * FROM transaction;")).rows;
        res.status(200).send(transactions);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
}));
app.post("/api/transaction", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    * The object received is
    * {items: {product: Product, amount: number }[], users: Account[] }
    */
    try {
        const transactionPromises = [];
        console.log("What was the transaction?");
        console.log(req.body);
        const transaction = (0, utils_1.toNewTransaction)(req.body);
        // Check user ID's and product ids again!
        transaction.users.forEach((user) => {
            transaction.items.forEach((item) => {
                const addTransaction = database_1.db.query(`
                        INSERT INTO transaction
                        (account_id, username, product_id, product_name, amount)
                        VALUES($1, 
                            (SELECT username FROM account WHERE id = $1),
                            $2,
                            (SELECT name FROM product WHERE id = $2), 
                            $3) RETURNING *;`, [user.id, item.product.id, item.amount]);
                transactionPromises.push(addTransaction);
            });
        });
        yield Promise.all(transactionPromises);
        const balancePromises = [];
        // Now update the balances
        transaction.users.forEach((user) => {
            // Get the total price of the products
            const cost = transaction.items.reduce((totalCost, item) => {
                return totalCost + item.amount * item.product.pricein;
            }, 0);
            transaction.items.forEach((item) => {
                const setAmount = database_1.db.query(`
                UPDATE account SET balance=balance - $1 WHERE id=$2`, [cost, user.id]);
                balancePromises.push(setAmount);
            });
        });
        yield Promise.all(balancePromises);
        res.status(200).send("OK");
    }
    catch (e) {
        console.log("Transaction failed");
        console.log(e);
        res.status(400).send(e);
    }
}));
app.listen(PORT, () => {
    return console.log("Server running on port " + PORT);
});
//# sourceMappingURL=index.js.map
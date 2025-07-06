import type { Account, Product, Transaction, UserType } from "./types";
import { createClient } from "redis";

const toNewAccount = (object: unknown): Account => {
    if (isValidAccount(object)) {
        return object as Account
    } else {
        throw new Error("Invalid account structure")
    }
}

const isValidAccount = (account: any): account is Account => {
    const hasValidId = typeof account.id === "undefined" || typeof account.id === "number"
    const hasValidBalance = typeof account.balance === "undefined" || typeof account.balance === "number"
    const hasValidPin = account.pincode === null || typeof account.pincode === "string"


    return (
        typeof account === "object" &&
        typeof account.username === 'string' &&
        hasValidBalance &&
        isValidUserType(account.category) &&
        hasValidId &&
        hasValidPin
    )
}

const isValidUserType = (category: any): category is UserType => {
    return ['ASUKAS', 'VANHA', 'HANGAROUND'].includes(category);
}


// Product object validation
const toNewProduct = (object: unknown): Product => {
    if (isValidProduct(object)) {
        return object as Product
    } else {
        throw new Error("Invalid product structure")
    }
}

const isValidProduct = (product: any): product is Product => {
    return (
        typeof product.name === "string" &&
        typeof product.pricein === "number" &&
        typeof product.priceout === "number"
    )
}

const toNewTransaction = (object: unknown): Transaction => {
    if (isValidTransaction(object)) {
        return object as Transaction
    } else {
        throw new Error("Invalid transcation structure")
    }
}

const isValidTransaction = (transaction: any): transaction is Transaction => {

    return (
        transaction &&
        Array.isArray(transaction.items) &&
        transaction.items.every((item: any) => isValidProduct(item.product) && typeof item.amount === "number") &&
        transaction.users.every(isValidAccount)
    )
}

console.log("redis url?")
console.log(Bun.env["REDIS_URL"])
const redisClient = await createClient({
    url: Bun.env["REDIS_URL"]
})
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

const CACHE_ACCOUNT_TRANSACTIONS = "accounts:transactions";
const CACHE_ACCOUNTS = "accounts";
const CACHE_PRODUCTS = "products";
const CACHE_CHANGE = "change";

const cleanRedisAccounts = async () => {
    await redisClient.del(CACHE_ACCOUNTS)
    await redisClient.del(CACHE_ACCOUNT_TRANSACTIONS)
}

const cleanRedisProducts = async () => {
    await redisClient.del(CACHE_PRODUCTS)
}

const cleanRedisChange = async () => {
    await redisClient.del(CACHE_CHANGE)
}

export { toNewAccount, toNewProduct, toNewTransaction, redisClient, cleanRedisAccounts, cleanRedisProducts, cleanRedisChange }
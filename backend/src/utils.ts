import type { Account, Product, Transaction } from "@app/common";
import { createClient } from "redis";

const toNewAccount = (object: unknown): Account => {
    if (isValidAccount(object)) {
        return {
            ...object,
            unlocked_until:
                object.unlocked_until === null
                    ? null
                    : new Date(object.unlocked_until!)
        } as Account;
    } else {
        console.log(object);
        throw new Error("Invalid account structure");
    }
};

const isValidAccount = (account: unknown): account is Account => {
    if (typeof account !== "object" || account === null) return false;
    const acc = account as Record<string, unknown>;
    const hasValidId =
        typeof acc["id"] === "undefined" || typeof acc["id"] === "number";
    const hasValidBalance =
        typeof acc["balance"] === "undefined" || typeof acc["balance"] === "number";
    const hasValidPin =
        !acc["pincode"] ||
        acc["pincode"] === null ||
        typeof acc["pincode"] === "string"
    const hasValidUnlockDate =
        !acc["unlocked_until"] ||
        acc["unlocked_until"] === null ||
        acc["unlocked_until"] instanceof Date ||
        (typeof acc["unlocked_until"] === "string" && !isNaN(Date.parse(acc["unlocked_until"])));

    const valAcc =
        typeof acc["username"] === 'string' &&
        hasValidBalance &&
        hasValidId &&
        hasValidPin &&
        hasValidUnlockDate;

    return valAcc;
};


// Product object validation
const toNewProduct = (object: unknown): Product => {
    if (isValidProduct(object)) {
        return object;
    } else {
        throw new Error("Invalid product structure");
    }
};

const isValidProduct = (product: unknown): product is Product => {
    const prod = product as Record<string, unknown>;
    return (
        typeof prod["name"] === "string" &&
        typeof prod["pricein"] === "number" &&
        typeof prod["priceout"] === "number"
    );
};

const toNewTransaction = (object: unknown): Transaction => {
    if (isValidTransaction(object)) {
        return object;
    } else {
        throw new Error("Invalid transcation structure");
    }
};

const isValidTransaction = (transaction: unknown): transaction is Transaction => {
    if (typeof transaction !== "object" || transaction === null) return false;
    const trans = transaction as Record<string, unknown>

    return (
        transaction &&
        Array.isArray(trans["items"]) &&
        Array.isArray(trans["users"]) &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trans["items"].every((item: any) => isValidProduct(item.product) && typeof item.amount === "number") &&
        trans["users"].every(isValidAccount)
    );
};

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
    await redisClient.del(CACHE_ACCOUNTS);
    await redisClient.del(CACHE_ACCOUNT_TRANSACTIONS);
};

const cleanRedisProducts = async () => {
    await redisClient.del(CACHE_PRODUCTS);
};

const cleanRedisChange = async () => {
    await redisClient.del(CACHE_CHANGE);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const commonFieldMap = <T extends object>(expected: T, received: any): T => {
    const keys = Object.keys(expected) as (keyof T)[];

    const subset = {} as T;

    for (const key of keys) {
        subset[key] = received[key];
    }

    return subset;
};

const normalize = (date: Date) => new Date(Math.floor(date.getTime() / 1000) * 1000);


export { toNewAccount, toNewProduct, toNewTransaction, redisClient, cleanRedisAccounts, cleanRedisProducts, cleanRedisChange, commonFieldMap, normalize };
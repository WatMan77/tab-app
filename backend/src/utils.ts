import { Account, Product, Transaction, UserType } from "./types";

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

    return (
        typeof account === "object" &&
        typeof account.username === 'string' &&
        hasValidBalance &&
        isValidUserType(account.category) &&
        hasValidId
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
    const hasValidId = typeof product.id === "undefined" || typeof product.id === "number"
    return (
        typeof product.name === "string" &&
        typeof product.pricein === "number" &&
        typeof product.priceout === "number" &&
        hasValidId
    )
}

const toNewTransaction = (object: unknown): Transaction => {
    if (isValidTranscation(object)) {
        return object as Transaction
    } else {
        throw new Error("Invalid transcation structure")
    }
}

const isValidTranscation = (transaction: any): transaction is Transaction => {
    return (
        typeof transaction.account_id === "number" &&
        typeof transaction.username === "string" &&
        typeof transaction.product_id === "number" &&
        typeof transaction.product_name === "string" &&
        typeof transaction.amount === "number" &&
        Boolean(Date.parse(transaction.transaction_date))

    )
}

export { toNewAccount, toNewProduct, toNewTransaction }
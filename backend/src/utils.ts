import { Account, UserType } from "./types";

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

export { toNewAccount }
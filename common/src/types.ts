enum UserType {
    ASUKAS = "ASUKAS",
    VANHA = "VANHA",
    HANGAROUND = "HANGAROUND"
}

interface Account {
    username: string,
    category: UserType,
    balance?: number,
    closed: boolean,
    recent?: Date | null,
    id?: number,
    pincode?: string,
    unlocked_until?: Date | null
}

interface UpdateAccount {
    username: string,
    category?: UserType,
    balance?: number,
    closed: boolean,
    recent?: Date | null,
    newName?: string,
    id?: number,
    newCategory?: UserType,
    change: number,
    pincode?: string,
    unlocked_until?: Date | null
}

interface Product {
    name: string,
    pricein: number,
    priceout: number,
    color: Color,
    newName?: string
}


interface Transaction {
    items: { product: Product, amount: number }[],
    users: Account[]
}

interface Log {
    name: string,
    product_name: string,
    transaction_date: Date,
    amount: number
}

interface LogInformation {
    logs: Log[],
    count: number
}

export enum Color {
    WHITE = "WHITE",
    RED = "RED",
    BLUE = "BLUE",
    YELLOW = "YELLOW",
    REDBLUE = "REDBLUE",
    YELLOWBLACK = "YELLOWBLACK",
    BLACK = "BLACK",
    EMPTY = "EMPTY"
}

interface BalanceChangeInfo {
    changes: BalanceChange[],
    count: number
}

interface BalanceChange {
    username: string,
    change_date: Date,
    change: number
}

export { UserType }
export type { Account, Product, Transaction, Log, LogInformation, UpdateAccount, BalanceChange, BalanceChangeInfo }

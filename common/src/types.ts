interface Account {
    username: string,
    balance?: number,
    closed: boolean,
    recent?: Date | null,
    id?: number,
    pincode?: string,
    // Whether a pin is set. The list endpoints send this instead of the hash, so the frontend
    // can tell a locked account from one that merely has an expired unlocked_until.
    has_pincode?: boolean,
    unlocked_until?: Date | null
}

interface UpdateAccount {
    username: string,
    balance?: number,
    closed: boolean,
    recent?: Date | null,
    newName?: string,
    id?: number,
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


// Items carry a name and a quantity only. Prices are looked up from the product table, because
// the client used to send pricein and the server charged whatever it was told.
interface TransactionItem {
    name: string,
    amount: number
}

interface Transaction {
    items: TransactionItem[],
    users: Account[],
    // The free "Muu määrä" amount in cents. This is the one figure that genuinely cannot come
    // from the product table, so it is validated rather than looked up.
    other?: number
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

export type { Account, Product, Transaction, TransactionItem, Log, LogInformation, UpdateAccount, BalanceChange, BalanceChangeInfo }

enum UserType {
    ASUKAS = "ASUKAS",
    VANHA = "VANHA",
    HANGAROUND = "HANGAROUND"
}

interface User {
    name: string,
    type: UserType,
    username?: string,
    bank: number
}

interface Account {
    username: string,
    category: UserType,
    balance?: number,
    closed: boolean
    recent: Date | null,
    id?: number,
    unlocked_until: Date | null
    pincode: string | null
}

interface UpdateAccount {
    username: string,
    category: UserType,
    balance?: number,
    closed: boolean
    recent: Date | null,
    newName: string,
    change: number,
    pincode: string,
    unlockedUntil: Date | null
}

interface Product {
    name: string,
    pricein: number,
    priceout: number,
    color: Color
}

interface Admin {
    username: string,
    token: string
}

interface Log {
    id: number,
    product_name: string,
    transaction_date: Date,
    amount: number,
    user_id: number,
    sum: number,
    username: string
}

interface BalanceChange {
    username: string,
    change_date: Date,
    change: number
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

export { UserType }
export type { User, Product, Account, Admin, UpdateAccount, Log, BalanceChange }

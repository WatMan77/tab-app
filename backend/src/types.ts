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
    recent: Date | null
}

interface UpdateAccount {
    username: string,
    category: UserType,
    balance?: number,
    closed: boolean,
    recent: Date | null,
    newName: string
}

interface Product {
    name: string,
    pricein: number,
    priceout: number,
    color: Color
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

export enum Color {
    WHITE = "WHITE",
    RED = "RED",
    BLUE = "BLUE",
    YELLOW = "YELLOW",
    REDBLUE = "REDBLUE",
    YELLOWBLACK = "YELLOWBLACK",
    BLACK = "BLACK"
}

export { UserType }
export type { Account, Product, Transaction, Log, UpdateAccount }

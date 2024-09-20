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
    id?: number
}

interface UpdateAccount {
    username: string,
    category: UserType,
    balance?: number,
    closed: boolean
    recent: Date | null,
    newName: string
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
export type { User, Product, Account, Admin, UpdateAccount }

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
    recent: Date | null
}

interface Product {
    name: string,
    pricein: number,
    priceout: number
}

interface Admin {
    username: string,
    token: string
}

export { UserType }
export type { User, Product, Account, Admin }

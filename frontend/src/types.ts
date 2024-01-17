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
    id?: number,
    username: string,
    category: UserType,
    balance?: number
}

interface Product {
    id?: number,
    name: string,
    pricein: number,
    priceout: number
}

export { UserType }
export type { User, Product, Account }

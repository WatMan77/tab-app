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

interface Drink {
    name: string,
    price: number,
}

export { UserType }
export type { User, Drink, Account }

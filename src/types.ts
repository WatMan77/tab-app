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

interface Drink {
    name: string,
    price: number,
}

export { UserType }
export type { User, Drink}

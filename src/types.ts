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

export { UserType }
export type { User }

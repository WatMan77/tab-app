enum UserType {
    ASUKAS = "ASUKAS",
    VANHA = "VANHA",
    HANGAROUND = "HANGAROUND"
}

interface Account {
    username: string,
    category: UserType,
    balance?: number
}

interface Product {
    name: string,
    pricein: number,
    priceout: number
}


interface Transaction {
    items: { product: Product, amount: number }[],
    users: Account[]
}

export { Account, Product, Transaction, UserType }
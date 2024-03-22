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

interface Log {
    name: string,
    product_name: string,
    transaction_date: Date,
    amount: number
}

export { Account, Product, Transaction, UserType, Log }
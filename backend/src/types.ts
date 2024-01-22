enum UserType {
    ASUKAS = "ASUKAS",
    VANHA = "VANHA",
    HANGAROUND = "HANGAROUND"
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

/*interface Transaction {
    account_id: number,
    username?: string,
    product_id: number,
    product_name?: string,
    transaction_date?: Date,
    amount: number
}*/

interface Transaction {
    items: { product: Product, amount: number }[],
    users: Account[]
}

export { Account, Product, Transaction, UserType }
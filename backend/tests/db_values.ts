import pg from "pg";
import { Account, Product, UserType } from "../src/types";

const accounts: Account[] = [
    {
        username: "Jarmo",
        category: UserType.ASUKAS,
        balance: 1000
    },
    {
        username: "Kari",
        category: UserType.ASUKAS,
        balance: -1000
    },
    {
        username: "Mikael",
        category: UserType.VANHA,
        balance: 10000
    }
]

const products: Product[] = [
    {
        name: "Kalja",
        pricein: 100,
        priceout: 200
    },
    {
        name: "Lonkero",
        pricein: 140,
        priceout: 250
    },
    {
        name: "Jaegermeister",
        pricein: 240,
        priceout: 300
    }
]

const admin = {
    username: "admin",
    password: "password123"
}


export { accounts, products, admin }
import { type Account, type Product, UserType } from "../src/types";
import { Color } from "../src/types";
const accounts: Account[] = [
    {
        username: "Jarmo",
        category: UserType.ASUKAS,
        balance: 1000,
        closed: false,
        recent: null,
        unlocked_until: null,
        pincode: null
    },
    {
        username: "Kari",
        category: UserType.ASUKAS,
        balance: -1000,
        closed: false,
        recent: null,
        unlocked_until: null,
        pincode: null
    },
    {
        username: "Mikael",
        category: UserType.VANHA,
        balance: 10000,
        closed: false,
        recent: null,
        unlocked_until: null,
        pincode: null
    }
]

const products: Product[] = [
    {
        name: "Kalja",
        pricein: 100,
        priceout: 200,
        color: Color.WHITE
    },
    {
        name: "Lonkero",
        pricein: 140,
        priceout: 250,
        color: Color.BLUE
    },
    {
        name: "Jaegermeister",
        pricein: 240,
        priceout: 300,
        color: Color.RED
    }
]

const admin = {
    username: "admin",
    password: "password123"
}


export { accounts, products, admin }
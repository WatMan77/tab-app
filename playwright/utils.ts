import { type Account, type Product, Color } from "@app/common";
import { faker } from '@faker-js/faker';

faker.seed(479407)
const normalize = (date: Date) => new Date(Math.floor(date.getTime() / 1000) * 1000);

const accounts: Account[] = [
    {
        username: "Jarmo",
        balance: 1000,
        closed: false,
        recent: null,
        unlocked_until: null,

    },
    {
        username: "Kari",
        balance: -1000,
        closed: false,
        recent: null,
        unlocked_until: null,

    },
    {
        username: "Mikael",
        balance: 10000,
        closed: false,
        recent: null,
        unlocked_until: null,

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

const drinks: string[] = ["Beer", "Long Drink", "Water", "Soda", "Vodka"]

const admin = {
    username: "admin",
    password: "password123"
}

const createRandomAccount = (): Account => {
    const pinBool = faker.datatype.boolean()
    const unlockBool = faker.datatype.boolean()
    const unlocked_until = pinBool ? (unlockBool ? faker.date.past() : faker.date.future()) : null;
    const o: Account = {
        username: faker.internet.username(),
        closed: faker.datatype.boolean(),
        balance: faker.number.int(50000)
    }
    if (pinBool) {
        o.pincode = faker.string.numeric({ allowLeadingZeros: true, length: 4 });
        o.unlocked_until = normalize(unlocked_until!)
    }

    return o;
}

const createRandomProduct = (name?: string): Product => {
    return {
        name: name ?? faker.helpers.arrayElement(drinks),
        color: faker.helpers.arrayElement(Object.values(Color)),
        pricein: faker.number.int({ min: 100, max: 10000 }),
        priceout: faker.number.int({ min: 100, max: 10000 })
    }
}


export { accounts, products, admin, createRandomAccount, createRandomProduct }
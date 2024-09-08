import pg from "pg";
import { migrate } from 'postgres-migrations';

const test_variables = {
    user: "postgres",
    password: "test",
    host: "localhost",
    port: 5432,
    database: "test-db"
}


const prod_variables = {
    user: process.env["POSTGRES_USERNAME"]!,
    password: process.env["POSTGRES_PASSWORD"]!,
    host: process.env["HOST"] ?? "localhost",
    port: 5432,
    database: process.env["POSTGRES_DB"]!
}

const dbConfig = Bun.env.NODE_ENV === "test" || Bun.env.NODE_ENV === "dev"
    ? test_variables
    : prod_variables

const pool = new pg.Pool(dbConfig)
const initDb = async () => {
    try {
        await migrate(dbConfig, './migrations');
    } catch (e) {
        console.log("DB initialization failed")
        console.log(e)
    }
}

console.log("NODE_ENV?!?!?", Bun.env.NODE_ENV)
console.log("db config?", dbConfig)

if (Bun.env.NODE_ENV === "dev") {
    await initDb()
    console.log("DB initialized")
} else {
    await initDb()
}

export { pool as db, initDb }
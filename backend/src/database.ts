import pg from "pg";
import { migrate } from 'postgres-migrations';

const test_variables = {
    user: process.env["POSTGRES_USERNAME"] ?? "postgres",
    password: process.env["POSTGRES_PASSWORD"] ?? "test",
    host: process.env["HOST"]! || "localhost",
    port: 5432,
    database: process.env["POSTGRES_DB"] ?? "test-db"
}


const dev_variables = {
    user: process.env["POSTGRES_USERNAME"]!,
    password: process.env["POSTGRES_PASSWORD"]!,
    host: process.env["HOST"]! || "localhost",
    port: 5432,
    database: process.env["POSTGRES_DB"]!
}

const pool = new pg.Pool(test_variables)
const initDb = async () => {
    try {
        await migrate(test_variables, './migrations');
    } catch (e) {
        console.log("DB initialization failed")
        console.log(e)
    }
}

console.log("NODE_END?!?!?", Bun.env.NODE_ENV)

if (Bun.env.NODE_ENV === "test" || Bun.env.NODE_ENV === "dev") {
    initDb().then(() => console.log("DB initialized"))
}

export { pool as db, initDb }
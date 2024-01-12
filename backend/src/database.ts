import { Pool } from "pg";
import { migrate } from 'postgres-migrations';
const pool = new Pool({
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    host: "localhost",
    port: 5432,
    database: process.env.POSTGRES_DB
})


const initDb = async () => {
    try {
        await migrate({
            user: process.env.POSTGRES_USERNAME ?? "",
            password: process.env.POSTGRES_PASSWORD ?? "",
            host: "localhost",
            port: 5432,
            database: process.env.POSTGRES_DB ?? ""
        }, './migrations');
    } catch (e) {
        console.log("DB initialization failed")
        console.log(e)
    }
}

initDb().then(() => console.log("DB initialized"))


console.log("Connecting to pool...")

export { pool as db }
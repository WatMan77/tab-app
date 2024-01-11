import { Pool } from "pg";
const pool = new Pool({
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    host: "localhost",
    port: 5432,
    database: process.env.POSTGRES_DB
})

console.log("ENV", process.env)

console.log("Connecting to pool...")

export { pool as db }
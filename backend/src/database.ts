import pg from "pg";
import { migrate } from 'postgres-migrations';
import knexConfig from "../knexfile";
import Knex from "knex";
const knex = Knex(knexConfig.development);

const dbConfig = {
    user: Bun.env["POSTGRES_USER"]!,
    password: Bun.env["POSTGRES_PASSWORD"]!,
    host: Bun.env["HOST"] ?? "localhost",
    port: 5432,
    database: Bun.env["POSTGRES_DB"]!
}
console.log("db Config?")
console.log(dbConfig)
const pool = new pg.Pool(dbConfig)

const clearDatabase = async () => {
    if (!(Bun.env.NODE_ENV === "test" || Bun.env.NODE_ENV === "development")) {
        throw Error(`NODE_ENV is set to ${Bun.env.NODE_ENV}. Clearing database not allowed`)
    }
    const tables = ["admin_change", "account", "transaction", "admin", "product"];
    const query = tables.map((table) => `TRUNCATE ${table} RESTART IDENTITY CASCADE`).join("; ");
    await pool.query(query);
}

const initDb = async () => {
    try {
        await migrate(dbConfig, './migrations');
        await knex.migrate.latest();
    } catch (e) {
        console.log("DB initialization failed")
        console.log(e)
    }
}

if (Bun.env.NODE_ENV === "development") {
    await initDb()
    console.log("DB initialized")
}

export { pool as db, initDb, clearDatabase }
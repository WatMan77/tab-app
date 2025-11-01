import { SQL } from "bun"
import { migrate } from 'postgres-migrations';
import knexConfig from "../knexfile";
import Knex from "knex";
import { redisClient } from "./utils";
const knex = Knex(knexConfig.development);

const dbConfig = {
    user: Bun.env["POSTGRES_USER"]!,
    password: Bun.env["POSTGRES_PASSWORD"]!,
    host: Bun.env["POSTGRES_HOST"] ?? "127.0.0.1",
    port: 5432,
    database: Bun.env["POSTGRES_DB"]!
}
console.log(dbConfig)
const pool = new SQL(`postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`)

const clearDatabase = async () => {
    if (!(Bun.env.NODE_ENV === "test" || Bun.env.NODE_ENV === "development")) {
        throw Error(`NODE_ENV is set to ${Bun.env.NODE_ENV}. Clearing database not allowed`)
    }
    const tables = ["admin_change", "account", "transaction", "admin", "product"];
    const query = tables
        .map((table) => `TRUNCATE ${table} RESTART IDENTITY CASCADE`)
        .join("; ");

    await pool.unsafe(query);
}

const initDb = async () => {
    try {
        await redisClient.flushAll();
        await migrate(dbConfig, './migrations');
        await knex.migrate.latest();
    } catch (e) {
        console.log("DB initialization failed")
        console.log(e)
    }
}

if (Bun.env.NODE_ENV === "development" || Bun.env.NODE_ENV === "test") {
    await initDb()
}

export { pool as db, initDb, clearDatabase }
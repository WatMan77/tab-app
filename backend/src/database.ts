import pg from "pg";
import { migrate } from 'postgres-migrations';
import knexConfig from "../knexfile";
import Knex from "knex";
const knex = Knex(knexConfig.development);

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
        await knex.migrate.latest();
    } catch (e) {
        console.log("DB initialization failed")
        console.log(e)
    }
}

if (Bun.env.NODE_ENV === "dev") {
    await initDb()
    console.log("DB initialized")
}

export { pool as db, initDb }
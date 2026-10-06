import { SQL } from "bun";
import { migrate } from 'postgres-migrations';
import { redisClient } from "./utils";

const dbConfig = {
    user: Bun.env["POSTGRES_USER"]!,
    password: Bun.env["POSTGRES_PASSWORD"]!,
    host: Bun.env["POSTGRES_HOST"] ?? "127.0.0.1",
    port: 5432,
    database: Bun.env["POSTGRES_DB"]!
};
const psqlString = Bun.env["POSTGRES_URL"];
const pool = new SQL(psqlString!);

// The reset/seed endpoints and clearing the database are only allowed in test and development.
// CI opts in with ENABLE_TEST_ENDPOINTS=true so the end-to-end tests can run against the
// production build. Never set it in real production.
const testToolsAllowed =
    Bun.env.NODE_ENV === "test" ||
    Bun.env.NODE_ENV === "development" ||
    Bun.env["ENABLE_TEST_ENDPOINTS"] === "true";

const clearDatabase = async () => {
    if (!testToolsAllowed) {
        throw Error(`NODE_ENV is set to ${Bun.env.NODE_ENV}. Clearing database not allowed`);
    }
    const tables = ["admin_change", "account", "transaction", "admin", "product"];
    const query = tables
        .map((table) => `TRUNCATE ${table} RESTART IDENTITY CASCADE`)
        .join("; ");

    await pool.unsafe(query);
};

const initDb = async () => {
    try {
        await redisClient.flushAll();
        await migrate(dbConfig, './migrations');
    } catch (e) {
        console.log("DB initialization failed");
        console.log(e);
    }
};

await initDb();

export { pool as db, initDb, clearDatabase, testToolsAllowed };
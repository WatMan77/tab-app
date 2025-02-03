import dotenv from 'dotenv';
dotenv.config();

const config = {
    development: {
        client: 'pg',
        connection: {
            host: "localhost",
            user: "postgres",
            password: "test",
            database: "test-db"
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './knex-migrations',
        },
    },
    prod: {
        client: 'pg',
        connection: {
            host: process.env["HOST"],
            user: process.env["POSTGRES_USER"],
            password: process.env["POSTGRES_PASSWORD"],
            database: process.env["POSTGRES_DB"],
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './knex-migrations',
        },
    },
};

export default config;

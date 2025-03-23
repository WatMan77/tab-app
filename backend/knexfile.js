import dotenv from 'dotenv';
const env = process.env.NODE_ENV;
dotenv.config({ path: `.env.${env}` });

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
    test: {
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
    production: {
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

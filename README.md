# The project uses Bun

Install bun according to instructions from here: https://bun.sh/

In both backend and frontend run 'bun install' and you should be ok

## In frontend

bun install

bun run dev

## .env file

Backend requires a .env file to run. You can insert the following values for development and test purposes

POSTGRES_USER=postgres

POSTGRES_DB=test-db

POSTGRES_PASSWORD=test

SECRET=secret

## Running backend

bun install

bun run dev

# Run tests

## Backend Tests

cd backend

bun run test

## Playwright tests

cd playwright

bun run test

# Start a build

docker-compose up

Here be careful about the environment variables. For example, the host in backend
needs to have the same name as the service name of the database.

# Updating database

In case there changes have to be made to the structure of the database, use knex.
To run all newest migrations run while Database is running

bunx knex migrate:latest --env prod

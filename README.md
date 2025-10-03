# The project uses Bun

Install bun according to instructions from here: https://bun.sh/

In both backend and frontend run `bun install` and you should be ok

## In frontend

`bun install`

`bun run dev`

## .env files

Project is configurated to use 3 .env files
- .env.test
- .env.development
- .env.production

An example env file can hold the following value

POSTGRES_USER=postgres

POSTGRES_DB=test-db

POSTGRES_PASSWORD=test

SECRET=secret

BACKUP_FILE=backup.sql

DESTINATION_DIR=/srv/mybackups # Desintation directory on the remote server to store backup database files

SSHPASS=&lt;ssh password for your remote server&gt;

REDIS=redis://localhost:6379 -> For production use redis://redis:6379

## Running backend

`bun install`

`bun run dev`

# Run tests

## Backend Tests

`cd backend`

`bun run test`

## Playwright tests

cd playwright

`bun run test`

`bun run test:ui`

# Start a build

`docker-compose --env-file <env file> up backend frontend redis db`

For example

`docker-compose --env-file .env.production up backend frontend redis db`

Here be careful about the environment variables. For example, the host in backend
needs to have the same name as the service name of the database.

# Updating database

In case there changes have to be made to the structure of the database, use knex.
To run all newest migrations run while Database is running

`bunx knex migrate:latest --env prod`

# Scripts

## backup.sh
Save the backup on the remote server

## download-backup.sh
Download the newest database backup from the server

## restore.sh
Insert downloaded .sql file to the running databse

`./restore.sh production`

## Run production
In the root of the project, run `bun run production` 
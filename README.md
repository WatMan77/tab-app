# The project uses Bun

Install bun according to instructions from here: https://bun.sh/

In both backend and frontend run `bun install` and you should be ok

## In frontend

`bun install`

`bun run dev`

## Environment files

There are three env files, all in the repo root: `.env.development`, `.env.test` and
`.env.production`. Each one is shared by the backend, the frontend, Docker Compose and the backup
scripts. The real files are git-ignored so that secrets never reach the repository, and each has a
committed `.example` template next to it:

```bash
for f in .env.*.example; do cp -n "$f" "${f%.example}"; done
```

`cp -n` never overwrites a file that already exists. The development and test templates work as
they are. In the production template, replace every `CHANGE_ME`.

| Variable | Used for |
| --- | --- |
| `POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PASSWORD` | Database credentials. Docker Compose reads them to create the database |
| `POSTGRES_HOST`, `POSTGRES_URL` | How the backend connects. In production the host is `db`, the name of the compose service |
| `SECRET` | Signs the admin login tokens |
| `REDIS_URL` | `redis://localhost:6379` in development, `redis://redis:6379` in production |
| `VITE_API_URL` | Frontend only, optional. The backend address for the Socket.IO connection. Defaults to `http://localhost:3000` |
| `DB_CONTAINER`, `REDIS_CONTAINER` | Backup and restore scripts only. The container names to run `pg_dump`, `pg_restore` and `redis-cli` in |
| `DESTINATION_DIR`, `SSHPASS` | Backup scripts only, in `.env.production` |

The backend passes the matching file explicitly, so `bun run dev` loads `../.env.development`
through Bun's `--env-file`. A real environment variable still wins over the file, which is how CI
supplies everything without writing one. The frontend reads the same files because
`vite.config.ts` sets `envDir: '..'`, but Vite only exposes names beginning with `VITE_`, so the
database credentials in the same file never reach the browser.

In Docker the backend gets these through `env_file:` in `docker-compose.yml` rather than from a
file baked into the image. `VITE_API_URL` is different: Vite inlines it at build time, so it is
passed as a build argument.

The password in `POSTGRES_URL` has to match `POSTGRES_PASSWORD`.

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

In case there changes have to be made to the structure of the database, use postgres-migrations.
The backend will automatically run all migrations.

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
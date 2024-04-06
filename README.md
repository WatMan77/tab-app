# The project uses Bun

Install bun according to instructions from here: https://bun.sh/

In both backend and frontend run 'bun install' and you should be ok

## In frontend

bun run dev

## In backend

bun run dev

# Run tests

bun run test

# Start a build

docker-compose up

Here be careful about the environment variables. For example, the host in backend
needs to have the same name as the service name of the database.

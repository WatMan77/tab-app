# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

TabApp is a bar-tab ("piikki") web app: people press their name, pick products, and the cost is charged to their account; admins manage accounts, balances and products. It is meant to run on one device at a time. See `README.md` for setup, ports, env variables, production and backups.

## Layout

Bun projects, each with its own `package.json` and `bun install` (there are no workspaces):

- `backend/` – Express + Socket.IO API, run directly by Bun (no build step). Entry is `backend/index.ts`.
- `frontend/` – React 19 + Vite + MUI + SCSS.
- `common/` – shared TypeScript types, imported as `@app/common` through `file:../common`. It exports raw `.ts`, so there is nothing to build.
- `playwright/` – end-to-end tests (need Node.js installed, Bun alone is not enough).

## Commands

Postgres and Redis must be running before the backend starts or any backend test runs: `docker compose --env-file .env.test up test-db redis -d` from the repo root. `db` and `test-db` both bind port 5432, so run only one. Development and tests share the same `test-db`, and the test suites truncate it.

| Task | Command |
| --- | --- |
| Backend dev server (port 3000) | `cd backend && bun run dev` |
| Frontend dev server (port 5173) | `cd frontend && bun run dev` |
| Frontend production build | `cd frontend && bun run build` |
| Backend type-check | `cd backend && bun run tsc` |
| Lint | `bun run lint` in `backend/` or `frontend/` (the frontend uses `--max-warnings 0`) |
| All backend tests | `cd backend && bun run test` |
| One backend test file | `cd backend && NODE_ENV=test BUN_TEST_CONCURRENCY=1 bun --env-file=../.env.test test tests/account.test.ts --timeout 20000` |
| All Playwright tests | `cd playwright && bun run test` (needs DB, backend and frontend already running) |
| One Playwright test | `cd playwright && bunx playwright test tests/admin.spec.ts -g "Log in"` |

Backend tests must run serially (`BUN_TEST_CONCURRENCY=1`) because every test file clears and reseeds the same database. The frontend has no unit tests.

## Backend architecture

- **Import-time side effects.** `src/database.ts` runs migrations at import (top-level `await initDb()`), and `src/utils.ts` connects to Redis at import. So importing almost any backend module needs Postgres and Redis up, and the process must be started with `backend/` as the working directory (migrations path is `./migrations`).
- **Two DB configs.** Queries go through a Bun `SQL` pool built from `POSTGRES_URL`, while `postgres-migrations` uses a separate config built from `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB`. The two must point at the same database. Write queries as `db\`...\`` tagged templates so values stay parameterized.
- **Server export.** `index.ts` mounts the routers under `/api/*` (`src/routes/*.ts`), and the default export is the HTTP `server`. `listen()` is skipped when `NODE_ENV=test`, because the tests use `supertest` against the export.
- **Bootstrap admin.** `GET /api/admin/admin-check` reports whether any admin exists; the front page redirects to `/create-admin` when none does, and `requireAdminIfExists` in `src/middlewares.ts` leaves `POST /api/admin` open only until the first admin is created. This flow does not exist in the sibling jomipiikki repo — don't let a port overwrite it.
- **Request validation** is done with hand-written type guards in `src/utils.ts` (`toNewAccount`, `toNewProduct`, `toNewTransaction`). Reuse or extend these when adding fields.
- **Redis cache.** `GET /api/account` and `GET /api/account/transactions` are cached for 600 s, and there are also product and change caches. Any route that writes accounts, products or balance changes must call `cleanRedisAccounts`, `cleanRedisProducts` or `cleanRedisChange` from `src/utils.ts`.
- **Auth.** Admin login returns a JWT signed with `SECRET`, and the frontend keeps it in `localStorage` under `loggedPiikkiAdmin`. Protection is opt-in per route via the `validateToken` middleware, so several routes are deliberately open — check each route before assuming it is protected. Passwords and PINs are hashed with `Bun.password` (argon2id), with a legacy bcrypt (`$2...`) upgrade path.
- **Test-only endpoints.** `DELETE /api/reset`, `GET /api/testdb`, `GET /api/testadmin` and `GET /api/health` exist only when `testToolsAllowed` is true (`NODE_ENV` is `test` or `development`, or `ENABLE_TEST_ENDPOINTS=true`). `reset` wipes the whole database, and `/api/health` returns 201. CI's production-build job enables them through `docker-compose.ci.yml`. Never enable them in real production.
- **Money** is stored and computed as integers (`balance`, `pricein`, `priceout`, transaction `sum`), so values are rounded with `toFixed(0)` before being written.

### Database and migrations

Plain SQL files in `backend/migrations/` named `<number>_<description>.sql`, applied automatically at startup. Never edit an applied migration (its hash is stored and the runner fails with "Hashes don't match"). Add the next consecutive number instead. `./delMigrations.sh <env>` drops the migration bookkeeping tables. The `Color` enum in `common/src/types.ts` must stay aligned with the `color_enum` SQL type and the product `CHECK` in `1_create_basics.sql`.

**Accounts have no categories and no nicknames** in this repo, unlike jomipiikki.

## Frontend architecture

- Routes are declared in `src/main.tsx` (each page is wrapped with `NavBar`). MUI dark theme, and React Compiler runs through a Babel plugin in `vite.config.ts`.
- API calls use `axios` with relative `/api/...` URLs. The Vite dev server proxies `/api` to `localhost:3000`, or to `backend:3000` when the `DOCKER` env var is set.
- Socket.IO is used for one event, `accounts-updated`, consumed in `src/App.tsx`. The client connects directly to `VITE_API_URL` or `http://localhost:3000`, bypassing the proxy.
- `src/utils.ts` holds `compareAccounts` (numeric, so a room-number prefix like `325. Kake` sorts naturally) and `matchesSearch`. Use them rather than ad-hoc sorting or filtering.
- **The Balances page is virtualized.** `Admin/AccountList.tsx` renders only the rows near the viewport with `useWindowVirtualizer`, and carries a `"use no memo"` directive because the React Compiler otherwise freezes the virtualizer's offsets. Rows are fully controlled from the `drafts` record in `BalanceAdmin.tsx`: a row unmounts when it scrolls away, so an uncontrolled input would lose a visible edit that "Confirm change" still applies.

## Tests

- Backend tests (`backend/tests/*.test.ts`) use `bun:test` and `supertest`. Each `beforeEach` clears the DB, flushes Redis, and reseeds using `faker` (fixed seed) and the helpers in `tests/db_values.ts`.
- Playwright tests reset and seed through the test-only endpoints. The reset calls are hardcoded to `http://localhost:3000`, while `BASE_URL` only changes where the frontend is loaded (for example `BASE_URL=http://localhost:4173` for the production build). Shared helpers are in `playwright/helpers.ts` and test data in `playwright/utils.ts`.
- When asserting on a user button, scope the locator to `.main-content`: `getByText(username)` also matches the toasts this app raises, and react-toastify's `pauseOnFocusLoss` stops them auto-closing in a headless run.

## Conventions

- Backend, `common/` and Playwright code use 4-space indentation, and the frontend uses 2 spaces. Match the file you are editing.
- There are three `.env.*` files, all in the repo root, shared by the backend, the frontend, Docker Compose and the scripts. They are git-ignored and each has a committed `.example` template. Don't commit real env files. The backend loads its one explicitly (`bun --env-file=../.env.<env>`) because Bun resolves env files relative to the working directory, and the frontend reads them because `vite.config.ts` sets `envDir: '..'`.
- The UI is mixed Finnish and English (`piikki` is a tab).

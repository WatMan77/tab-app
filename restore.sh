#!/bin/bash
set -euo pipefail

# Restores a pg_dump backup into one environment's database.
#
#   ./restore.sh development                        # newest backup_*.dump in this directory
#   ./restore.sh production backup_20260926.dump    # a specific file
#
# This drops and recreates the database, so everything currently in it is lost.

ENV=${1:-}
# Deliberately not called BACKUP_FILE: .env.production defines that for the backup scripts, and
# sourcing the environment file below would overwrite it.
DUMP_ARG=${2:-}

if [ -z "$ENV" ]; then
    echo "Usage: $0 <development|test|production> [backup file]"
    exit 1
fi

ENV_FILE=".env.$ENV"

if [ ! -f "$ENV_FILE" ]; then
    echo "Environment file '$ENV_FILE' not found."
    exit 1
fi

# Load environment variables
set -o allexport
# shellcheck source=/dev/null
source "$ENV_FILE"
set +o allexport

if [ -z "${DB_CONTAINER:-}" ]; then
    echo "DB_CONTAINER is not set in '$ENV_FILE'."
    exit 1
fi

if [ -z "${POSTGRES_DB:-}" ]; then
    echo "POSTGRES_DB is not set in '$ENV_FILE'."
    exit 1
fi

PG_USER=${POSTGRES_USER:-postgres}

# Resolved after sourcing, so an explicit argument always wins over anything the environment
# file happens to set. -t so the newest dump wins: plain "ls" sorts by name, which quietly
# restored a months-old backup whenever more than one dump was lying around in this directory.
DUMP_FILE=$DUMP_ARG

if [ -z "$DUMP_FILE" ]; then
    DUMP_FILE=$(ls -t backup_*.dump 2>/dev/null | head -n 1 || true)
fi

if [ -z "$DUMP_FILE" ]; then
    echo "❌ No backup .dump file found matching 'backup_*.dump' in $(pwd)"
    exit 1
fi

if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Backup file '$DUMP_FILE' does not exist"
    exit 1
fi

echo "Restoring '$DUMP_FILE' into database '$POSTGRES_DB' in container '$DB_CONTAINER'"

# Copy backup file to container
docker cp "$DUMP_FILE" "$DB_CONTAINER:/backup_file.dump"

# --force terminates the connections a running backend still holds. Without it dropdb fails with
# "database is being accessed by other users", and this script used to carry on regardless:
# createdb then failed as "already exists", pg_restore conflicted on every row, and the old data
# was left in place while the output scrolled past.
echo "Dropping and recreating '$POSTGRES_DB'"
docker exec "$DB_CONTAINER" dropdb -U "$PG_USER" --force --if-exists "$POSTGRES_DB"
docker exec "$DB_CONTAINER" createdb -U "$PG_USER" "$POSTGRES_DB"

# Guarded rather than left to set -e, so a benign ownership or ACL warning does not abort the run
# before the cache flush and the row count below.
if ! docker exec "$DB_CONTAINER" pg_restore -U "$PG_USER" -d "$POSTGRES_DB" /backup_file.dump; then
    echo "⚠️  pg_restore reported errors, check the output above"
fi

docker exec "$DB_CONTAINER" rm -f /backup_file.dump

# The API caches accounts and products in Redis for 600 s, so a restore has to drop the cache or
# the app keeps serving pre-restore data. Starting the backend also flushes it (initDb does), but
# a restore should not depend on remembering to restart.
if [ -n "${REDIS_CONTAINER:-}" ]; then
    docker exec "$REDIS_CONTAINER" redis-cli FLUSHALL > /dev/null
    echo "Flushed the Redis cache in '$REDIS_CONTAINER'"
else
    echo "⚠️  REDIS_CONTAINER is not set in '$ENV_FILE', so the Redis cache was not flushed."
    echo "   Restart the backend to clear it, or the API may serve pre-restore data for 10 minutes."
fi

# The silent failure this script used to have was only visible by querying the database, so say
# out loud what actually landed.
ACCOUNTS=$(docker exec "$DB_CONTAINER" psql -U "$PG_USER" -d "$POSTGRES_DB" -t -A -c "SELECT count(*) FROM account")
echo "✅ Restored '$DUMP_FILE' into '$POSTGRES_DB': $ACCOUNTS accounts"

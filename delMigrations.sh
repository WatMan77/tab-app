#!/bin/bash

# ---------------------------
# Configuration
# ---------------------------
ENV=$1  # Default to 'production' if no argument is passed
ENV_FILE=".env.$ENV"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    set -o allexport
    source "$ENV_FILE"
    set +o allexport
else
    echo "Environment file '$ENV_FILE' not found."
    exit 1
fi
TABLES=("knex_migrations" "knex_migrations_lock" "migrations")

# ---------------------------
# Drop tables loop
# ---------------------------
for TABLE in "${TABLES[@]}"; do
  echo "Dropping table: $TABLE"
  PGPASSWORD="$POSTGRES_PASSWORD"  psql -h 127.0.0.1 -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP TABLE IF EXISTS public.$TABLE CASCADE;"
done

echo "All specified tables dropped."
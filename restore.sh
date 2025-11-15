#!/bin/bash

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

BACKUP_FILE=$(ls backup_*.dump 2>/dev/null | head -n 1)

if [ -z "$BACKUP_FILE" ]; then
  echo "❌ No backup .dump file found matching 'backup_*.dump'"
  exit 1
fi

# Copy backup file to container
docker cp "$BACKUP_FILE" "$DB_CONTAINER:/backup_file.dump"

# Delete old database
docker exec $DB_CONTAINER dropdb -U postgres "$POSTGRES_DB"

# Create database to save data in
docker exec $DB_CONTAINER createdb -U postgres "$POSTGRES_DB"
# Insert data from the backup file
docker exec $DB_CONTAINER pg_restore -U postgres -d "$POSTGRES_DB" /backup_file.dump

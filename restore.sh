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

BACKUP_FILE=$(ls backup_*.sql 2>/dev/null | head -n 1)

if [ -z "$BACKUP_FILE" ]; then
  echo "❌ No backup .sql file found matching 'backup_*.sql'"
  exit 1
fi

# Copy backup file to container
docker cp "$BACKUP_FILE" "$DB_CONTAINER:/backup_file.sql"

# Delete old database
docker exec -it $DB_CONTAINER psql -U postgres -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\";"

# Create database to save data in
docker exec -it $DB_CONTAINER psql -U postgres -c "CREATE DATABASE \"$POSTGRES_DB\";"
# Insert data from the backup file
docker exec -it $DB_CONTAINER psql -U postgres -d "$POSTGRES_DB" -f /backup_file.sql

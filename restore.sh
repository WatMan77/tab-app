#!/bin/bash

if [ -f .env ]; then
    export $(cat .env | xargs)
fi

BACKUP_FILE="backup_*.sql"
# Copy backup file to container
docker cp $BACKUP_FILE $DB_CONTAINER:/backup_file.sql

# Delete old database
docker exec -it $DB_CONTAINER psql -U postgres -c "DROP DATABASE IF EXISTS piikki_db;"

# Create database to save data in
docker exec -it $DB_CONTAINER psql -U postgres -c "CREATE DATABASE piikki_db;"
# Insert data from the backup file
docker exec -it $DB_CONTAINER psql -U postgres -d piikki_db -f /backup_file.sql

#!/bin/bash

BACKUP_FILE="backup.sql"
DESTINATION_DIR="db_backups"

# Load the environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# pg_dump -U postgres test-db > $BACKUP_FILE

docker exec $DB_CONTAINER pg_dump -U postgres test-db > $BACKUP_FILE

# Save backup in katiska

sshpass -p $SSHPASS scp -o StrictHostKeyChecking=no $BACKUP_FILE joutomies@katiska.dy.fi:~/$DESTINATION_DIR/$BACKUP_FILE

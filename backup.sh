#!/bin/bash

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_$TIMESTAMP.sql"
DESTINATION_DIR="db_backups"

# Load the environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# The db is the POSTGRES_DB value in docker-compose.yml
docker exec $DB_CONTAINER pg_dump -U postgres piikki_db > $BACKUP_FILE

# Save backup in katiska

sshpass -p $SSHPASS scp -o StrictHostKeyChecking=no $BACKUP_FILE joutomies@katiska.dy.fi:~/$DESTINATION_DIR/$BACKUP_FILE

#rm -rf backup_*.sql
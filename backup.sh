#!/bin/bash

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_$TIMESTAMP.sql"
DESTINATION_DIR="/srv/joutavaa/piikki_jutut/db_backups"

cd /mnt/c/Users/cjout/projects/jomipiikki

# Load the environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# The db is the POSTGRES_DB value in docker-compose.yml
docker exec $DB_CONTAINER pg_dump -U postgres piikki_db > $BACKUP_FILE

# Save backup in katiska

sshpass -p $SSHPASS scp -o StrictHostKeyChecking=no $BACKUP_FILE joutomies@katiska.dy.fi:~$DESTINATION_DIR/$BACKUP_FILE
sshpass -p $SSHPASS ssh -o StrictHostKeyChecking=no $BACKUP_FILE joutomies@katiska.dy.fi "find $DESTINATION_DIR -name 'backup_*.sql' -type f -mtime +30 -exec rm {} \;"

rm -rf backup_*.sql

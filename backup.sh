#!/bin/bash

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_$TIMESTAMP.dump"
DESTINATION_DIR="/srv/joutavaa/piikki_jutut/db_backups"

cd /mnt/c/Users/cjout/projects/jomipiikki

# Load the environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
else
    echo "❌ No .env or .env.production file found. Cannot continue."
    exit 1
fi

# The db is the POSTGRES_DB value in docker-compose.yml
docker exec $DB_CONTAINER pg_dump -Fc -U postgres piikki_db > $BACKUP_FILE

# Save backup in katiska
gzip "$BACKUP_FILE"
sshpass -p $SSHPASS scp -o StrictHostKeyChecking=no "$BACKUP_FILE.gz" joutomies@katiska.dy.fi:"$DESTINATION_DIR/$BACKUP_FILE.gz"
sshpass -p $SSHPASS ssh -o StrictHostKeyChecking=no joutomies@katiska.dy.fi "find $DESTINATION_DIR -name 'backup_*.(sql|dump).gz' -type f -mtime +30 -exec rm {} \;"

rm -rf "$BACKUP_FILE.gz"

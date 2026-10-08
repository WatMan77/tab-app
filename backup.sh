#!/bin/bash
set -euo pipefail

# Dumps the production database and ships it to the backup host.
# Every step is checked: the previous version created the dump file with `>` before pg_dump ran,
# so a failed dump still produced a 0-byte file that was gzipped, uploaded and reported as success.

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_$TIMESTAMP.dump"

# Load the environment variables
if [ -f .env.production ]; then
    set -o allexport
    # shellcheck source=/dev/null
    source .env.production
    set +o allexport
else
    echo "❌ No .env.production file found. Cannot continue."
    exit 1
fi

for required in DB_CONTAINER POSTGRES_DB DESTINATION_URL DESTINATION_DIR SSHPASS; do
    if [ -z "${!required:-}" ]; then
        echo "❌ $required is not set in .env.production."
        exit 1
    fi
done

PG_USER=${POSTGRES_USER:-postgres}

# The database name, not the container name. These are different things and the old script
# passed the container name here, so pg_dump failed on every run.
echo "Dumping '$POSTGRES_DB' from container '$DB_CONTAINER'"
if ! docker exec "$DB_CONTAINER" pg_dump -Fc -U "$PG_USER" "$POSTGRES_DB" > "$BACKUP_FILE"; then
    echo "❌ pg_dump failed"
    rm -f "$BACKUP_FILE"
    exit 1
fi

if [ ! -s "$BACKUP_FILE" ]; then
    echo "❌ pg_dump produced an empty file"
    rm -f "$BACKUP_FILE"
    exit 1
fi

gzip "$BACKUP_FILE"

# The local copy is kept until the upload has actually succeeded.
# accept-new pins the host key on first use instead of disabling the check entirely:
# StrictHostKeyChecking=no would accept a changed key silently, on the one path that
# ships the whole database off-site.
SSH_OPTS=(-o StrictHostKeyChecking=accept-new)

if ! sshpass -p "$SSHPASS" scp "${SSH_OPTS[@]}" "$BACKUP_FILE.gz" "$DESTINATION_URL:$DESTINATION_DIR/$BACKUP_FILE.gz"; then
    echo "❌ Upload failed. The local copy is kept at $BACKUP_FILE.gz"
    exit 1
fi

# find -name takes a glob, not a regex: the old pattern 'backup_*.(sql|dump).gz' matched nothing,
# so the backup host kept every dump forever.
sshpass -p "$SSHPASS" ssh "${SSH_OPTS[@]}" "$DESTINATION_URL" \
    "find '$DESTINATION_DIR' -type f -mtime +30 \( -name 'backup_*.dump.gz' -o -name 'backup_*.sql.gz' \) -delete"

rm -f "$BACKUP_FILE.gz"
echo "✅ Backed up '$POSTGRES_DB' to $DESTINATION_URL:$DESTINATION_DIR/$BACKUP_FILE.gz"

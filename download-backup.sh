#!/bin/bash

if [ -f .env.production ]; then
    set -o allexport
    # shellcheck source=/dev/null
    source .env.production
    set +o allexport
fi

LATEST_BACKUP=$(sshpass -p $SSHPASS ssh $DESTINATION_URL \
"ls -t $DESTINATION_DIR/backup_*.dump.gz | head -n 1")

sshpass -p $SSHPASS scp $DESTINATION_URL:"$LATEST_BACKUP" .

gunzip backup_*.dump.gz
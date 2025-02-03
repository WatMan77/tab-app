#!/bin/bash

if [ -f .env ]; then
    export $(cat .env | xargs)
fi

LATEST_BACKUP=$(sshpass -p $SSHPASS ssh joutomies@katiska.dy.fi \
"ls -t $DESTINATION_DIR/backup_*.sql.gz | head -n 1")

sshpass -p $SSHPASS scp joutomies@katiska.dy.fi:"$LATEST_BACKUP" .

gunzip backup_*.sql.gz
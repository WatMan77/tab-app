#!/bin/bash

if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

LATEST_BACKUP=$(sshpass -p $SSHPASS ssh joutomies@katiska.dy.fi \
"ls -t $DESTINATION_DIR/backup_*.dump.gz | head -n 1")

sshpass -p $SSHPASS scp joutomies@katiska.dy.fi:"$LATEST_BACKUP" .

gunzip backup_*.dump.gz
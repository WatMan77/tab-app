#!/bin/bash
set -euo pipefail

# Downloads the newest backup and restores it into one environment.
#   ./full-restore.sh production
#
# This drops and recreates that environment's database, so everything in it is lost.

ENV=${1:-}

if [ -z "$ENV" ]; then
    echo "Usage: $0 <development|test|production>"
    exit 1
fi

# Old dumps are removed so restore.sh's "newest file" pick cannot land on a stale one. The old
# pattern was backup_*_*.sql, which never matched the backup_*.dump files actually produced.
rm -f backup_*.dump backup_*.dump.gz

./download-backup.sh
./restore.sh "$ENV"

#!/bin/bash
set -euo pipefail

# Fetches the newest dump from the backup host into the repo root, ready for ./restore.sh.

if [ -f .env.production ]; then
    set -o allexport
    # shellcheck source=/dev/null
    source .env.production
    set +o allexport
else
    echo "❌ No .env.production file found. Cannot continue."
    exit 1
fi

for required in DESTINATION_URL DESTINATION_DIR SSHPASS; do
    if [ -z "${!required:-}" ]; then
        echo "❌ $required is not set in .env.production."
        exit 1
    fi
done

SSH_OPTS=(-o StrictHostKeyChecking=accept-new)

LATEST_BACKUP=$(sshpass -p "$SSHPASS" ssh "${SSH_OPTS[@]}" "$DESTINATION_URL" \
    "ls -t '$DESTINATION_DIR'/backup_*.dump.gz 2>/dev/null | head -n 1")

# Without this guard an empty result turned the scp into `scp host: .`, which copies the remote
# home directory instead of a backup.
if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup_*.dump.gz found in $DESTINATION_URL:$DESTINATION_DIR"
    exit 1
fi

echo "Downloading $LATEST_BACKUP"
sshpass -p "$SSHPASS" scp "${SSH_OPTS[@]}" "$DESTINATION_URL:$LATEST_BACKUP" .

# Only the file just downloaded, rather than every gzipped dump in the directory.
gunzip -f "$(basename "$LATEST_BACKUP")"
echo "✅ Downloaded $(basename "${LATEST_BACKUP%.gz}")"

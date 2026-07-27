#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(dirname "$(readlink -f "$0")")"
DATA_DIR="${PROJECT_DIR}/pb_data"
BACKUP_DIR="${POKERTRACKER_BACKUP_DIR:-${PROJECT_DIR}/../PokerTracker-backups}"
BACKUP_TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_PATH="${BACKUP_DIR}/pb_data-${BACKUP_TIMESTAMP}.tar.gz"
BACKUP_TEMP_PATH="${BACKUP_PATH}.tmp"

cd "$PROJECT_DIR"

echo "==> Checking for local changes"
if [[ -n "$(git status --porcelain)" ]]; then
	echo "Local changes detected in $(pwd) — aborting. Commit, stash, or discard them first." >&2
	exit 1
fi

echo "==> Preparing PocketBase backup"
if [[ ! -f "${DATA_DIR}/data.db" ]]; then
	echo "PocketBase database not found at ${DATA_DIR}/data.db — aborting before shutdown." >&2
	exit 1
fi
mkdir -p "$BACKUP_DIR"

echo "==> Stopping running containers"
docker compose -f docker-compose.prod.yml down

echo "==> Backing up PocketBase data"
if ! (
	umask 077
	tar -C "$PROJECT_DIR" -czf "$BACKUP_TEMP_PATH" pb_data
	mv "$BACKUP_TEMP_PATH" "$BACKUP_PATH"
); then
	echo "Backup failed — restarting the existing production stack." >&2
	docker compose -f docker-compose.prod.yml up -d
	exit 1
fi
echo "Backup created at ${BACKUP_PATH}"

echo "==> Pulling latest code"
git pull

echo "==> Rebuilding and starting containers"
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Done. Current status:"
docker compose -f docker-compose.prod.yml ps

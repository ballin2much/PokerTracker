#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

echo "==> Checking for local changes"
if [[ -n "$(git status --porcelain)" ]]; then
	echo "Local changes detected in $(pwd) — aborting. Commit, stash, or discard them first." >&2
	exit 1
fi

echo "==> Stopping running containers"
docker compose -f docker-compose.prod.yml down

echo "==> Pulling latest code"
git pull

echo "==> Rebuilding and starting containers"
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Done. Current status:"
docker compose -f docker-compose.prod.yml ps

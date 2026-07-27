# Poker Tracker

A private leaderboard, session tracker, and six-max preflop trainer for a home poker group. It tracks career buy-ins, earnings, deposits/withdrawals, and per-session chip results, with admin-gated controls for anything that affects real money.

**Stack:** SvelteKit (Svelte 5, `adapter-node`) + PocketBase, styled with Tailwind CSS v4 (Nord theme), running in Docker.

## Features

- Leaderboard with career buy-in, earnings, deposits, withdrawals, and a net "owed/due" balance per player
- Session tracking: blinds, chip buy-in value, dollar multiplier, live buy-in adjustment, end-of-session chip calculator
- A warning banner when a finished session's total buy-ins don't reconcile with total ending stacks
- Admin-only controls: ending a session, recording ending stacks, adding deposit/withdrawal transactions, and creating new player accounts
- No public self-registration — new accounts are created by an admin from the leaderboard page
- Interactive 100bb, no-ante six-max preflop trainer covering first-in, facing-open, 3-bet, and 4-bet decisions
- Sequential hands that can continue from an opening decision into a 3-bet response
- Traditional six-seat table layout with larger four-color playing cards and exact action sizes
- Personal graphical range editor using a 13×13 starting-hand matrix
- Per-user range overrides with controls to reset one spot or every spot to the bundled defaults
- Mobile-responsive layout

## Preflop strategy storage

The bundled default strategy is defined in `SK/src/lib/trainer/ranges.ts`. It is part of the application source and is used whenever a player has not saved a personal override for a spot.

Personal ranges are stored in PocketBase:

- `strategy_packs` contains one strategy pack per user.
- `preflop_ranges` contains the user's saved action map for each edited spot.
- Saving a spot writes all 169 starting-hand classes for that spot.
- Resetting a spot deletes that override, causing the bundled default to be used again.
- Resetting all spots deletes every override belonging to that user's strategy pack.

The stored action format supports fold, call, and raise frequencies. The current editor paints a single pure action for each hand.

## Project layout

```
SK/                     SvelteKit app source
pocketbase/             PocketBase image and versioned schema migrations
pb_data/                PocketBase's SQLite database (gitignored — real data, never committed)
docker-compose.yml      Dev stack (live-reloading Vite dev server)
docker-compose.prod.yml Production stack (built app + Cloudflare Tunnel)
deploy.sh               Pull, rebuild, and restart the production stack
.env.example            Template for required production env vars
```

## Local development

```bash
docker compose up -d
```

This builds `SK/Dockerfile.dev` (Vite dev server with hot reload, source mounted live) and PocketBase, and serves the app at `http://localhost:5173`. PocketBase's admin UI is at `http://localhost:8090/_/`.

Useful commands inside the app container:

```bash
docker compose exec poker-app npm run check   # svelte-check
docker compose exec poker-app npx eslint .    # lint
```

The trainer is available at `/trainer`, and the authenticated user's range editor is at `/trainer/ranges`.

## Production deployment

The production stack (`docker-compose.prod.yml`) builds the app with `SK/Dockerfile` (multi-stage build → `node build`) and adds a `cloudflared` service so the app is reachable through a Cloudflare Tunnel without opening any ports on the router.

1. Copy `.env.example` to `.env` and fill in:
   - `ORIGIN` — the public HTTPS URL the app is served at (required, or SvelteKit's CSRF protection rejects every form submission)
   - `CLOUDFLARE_TUNNEL_TOKEN` — from the Cloudflare Zero Trust dashboard (Networks → Tunnels → your tunnel → Docker connector)
2. In the tunnel's Public Hostname config, point the Service URL at the host machine's LAN IP and port `3000` (not the Docker-internal `poker-app` hostname — that only resolves to connectors running on this same compose project's network, which breaks if you ever run multiple `cloudflared` connectors for the same tunnel).
3. Bring the stack up:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

`pb_data/` is not part of the deploy — it's the live database and is migrated separately (e.g. `rsync`) when moving to a new host, never overwritten by routine deploys.

### Routine deployments

On an existing production host, commit and push the changes from the development machine, then run:

```bash
./deploy.sh
```

The script requires a clean production worktree, verifies that the PocketBase database exists, stops the current stack, creates a compressed backup, pulls the latest commit, rebuilds the images, starts the stack, and prints container status.

Backups contain the complete `pb_data/` directory and are written outside the repository to `../PokerTracker-backups/` by default. Set `POKERTRACKER_BACKUP_DIR` to use another location:

```bash
POKERTRACKER_BACKUP_DIR=/path/to/backups ./deploy.sh
```

Backup filenames use UTC timestamps, and the script does not automatically delete old archives. If backup creation fails, deployment is aborted and the existing production stack is restarted.

PocketBase migrations in `pocketbase/pb_migrations/` are copied into the production image and applied automatically when PocketBase starts. The preflop trainer adds the `strategy_packs` and `preflop_ranges` collections and updates them for per-user ownership. Existing leaderboard and session data remains in the mounted `pb_data/` directory.

No manual schema step is required for the trainer update. The automatic backup runs before PocketBase can apply new migrations; just ensure the backup destination has enough free space. After deployment, verify that `poker_db`, `poker_ui`, and `poker_tunnel` are healthy:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 pocketbase poker-app
```

### Bootstrapping the first user

Since there's no public registration, the very first account (the first admin) has to be created directly through PocketBase's admin UI at `http://<host>:8090/_/` — create a record in the `users` collection with `admin` set to `true`. Every account after that can be created from the leaderboard page's "Add Player" form by any existing admin.

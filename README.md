# Poker Tracker

A private leaderboard and session tracker for a home poker group. Tracks career buy-ins, earnings, deposits/withdrawals, and per-session chip results, with admin-gated controls for anything that affects real money.

**Stack:** SvelteKit (Svelte 5, `adapter-node`) + PocketBase, styled with Tailwind CSS v4 (Nord theme), running in Docker.

## Features

- Leaderboard with career buy-in, earnings, deposits, withdrawals, and a net "owed/due" balance per player
- Session tracking: blinds, chip buy-in value, dollar multiplier, live buy-in adjustment, end-of-session chip calculator
- A warning banner when a finished session's total buy-ins don't reconcile with total ending stacks
- Admin-only controls: ending a session, recording ending stacks, adding deposit/withdrawal transactions, and creating new player accounts
- No public self-registration — new accounts are created by an admin from the leaderboard page
- Mobile-responsive layout

## Project layout

```
SK/                     SvelteKit app source
pocketbase/             Dockerfile for the PocketBase image
pb_data/                PocketBase's SQLite database (gitignored — real data, never committed)
docker-compose.yml      Dev stack (live-reloading Vite dev server)
docker-compose.prod.yml Production stack (built app + Cloudflare Tunnel)
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

### Bootstrapping the first user

Since there's no public registration, the very first account (the first admin) has to be created directly through PocketBase's admin UI at `http://<host>:8090/_/` — create a record in the `users` collection with `admin` set to `true`. Every account after that can be created from the leaderboard page's "Add Player" form by any existing admin.

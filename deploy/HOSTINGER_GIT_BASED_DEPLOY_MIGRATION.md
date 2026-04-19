# Hostinger Git-Based Deploy Migration

Last updated: `2026-04-20`

This runbook migrates the current `mikroliving.id` VPS from a copied source folder into a git-based deployment flow.

Use this when:

- `/opt/mikroliving-id` is running correctly
- the VPS app directory is **not** a git repository yet
- you want future releases to use `git pull` or checkout by commit

## Recommended approach

Do **not** convert the live folder in place first.

The safest migration is:

1. create a real remote repository for the current local code
2. push the current branch to that remote
3. clone the repo into a new directory on the VPS
4. copy `.env.production` into the new clone
5. build and verify there
6. cut PM2 over to the cloned repo

This avoids damaging the currently healthy live folder.

## Current known local state

- local branch: `master`
- local repo currently has no configured remote

That means the first migration step is to create a remote source of truth.

## Phase 1: Create the remote source of truth

Recommended: create a **private** repository on GitHub, GitLab, or Bitbucket.

Example local commands after the empty remote repo exists:

```bash
cd E:\xampp\htdocs\mikro-living
git remote add origin <REMOTE_URL>
git push -u origin master
```

Keep `master` for the first migration to avoid unnecessary branch churn during cutover.
You can rename to `main` later after production is stable.

## Phase 2: Prepare the VPS clone

On the VPS, do **not** delete `/opt/mikroliving-id`.

Create a fresh clone beside it:

```bash
mkdir -p /opt/releases
cd /opt/releases
git clone -b master <REMOTE_URL> mikroliving-id-$(date +%F-%H%M)
```

Then prepare the new release:

```bash
cd /opt/releases/mikroliving-id-<TIMESTAMP>
cp /opt/mikroliving-id/.env.production .env.production
npm ci
npm run build
NODE_ENV=production node src/config/migrate.js
```

## Phase 3: Cut PM2 over to the git clone

From the new cloned directory:

```bash
cd /opt/releases/mikroliving-id-<TIMESTAMP>
pm2 delete mikroliving-id-api >/dev/null 2>&1 || true
pm2 delete mikroliving-id-web >/dev/null 2>&1 || true
NODE_ENV=production pm2 start scripts/start-api.js --name mikroliving-id-api --update-env
NODE_ENV=production pm2 start ./node_modules/next/dist/bin/next --name mikroliving-id-web -- start -H 127.0.0.1 -p 3100
pm2 save
systemctl restart lsws
```

At this point PM2 will be running from the cloned git-based release directory.

## Phase 4: Verify after cutover

```bash
curl -k -I --resolve mikroliving.id:443:127.0.0.1 https://mikroliving.id
curl -k -I --resolve www.mikroliving.id:443:127.0.0.1 https://www.mikroliving.id
curl -k --resolve www.mikroliving.id:443:127.0.0.1 https://www.mikroliving.id/api/v1/health
curl -k -I --resolve www.mikroliving.id:443:127.0.0.1 https://www.mikroliving.id/cms
```

Expected:

- `mikroliving.id` -> `301`
- `www.mikroliving.id` -> `200`
- `/api/v1/health` -> `200`
- `/cms` without session cookie -> `307` to `/login?redirect=%2Fcms`

## Phase 5: Use git-based releases going forward

After PM2 is already running from the cloned repo, future releases are much simpler:

```bash
cd /opt/releases/mikroliving-id-<ACTIVE_RELEASE_DIR>
git pull --ff-only
npm ci
npm run build
NODE_ENV=production node src/config/migrate.js
pm2 restart mikroliving-id-api --update-env
pm2 restart mikroliving-id-web --update-env
pm2 save
systemctl restart lsws
```

## Important caveat

If you create a new timestamped clone for every release, `git pull` must be run in the currently active release directory, not in `/opt/mikroliving-id`, unless you later convert production to a stable symlink-based release layout.

## Optional cleanup after a stable cutover

Only after the new git-based release has been stable:

- keep `/opt/mikroliving-id` as a fallback backup for one release cycle, or
- move it to `/opt/mikroliving-id.pre-git-migration`

Do not delete the old live folder immediately after cutover.

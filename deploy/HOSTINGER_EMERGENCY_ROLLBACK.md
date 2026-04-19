# Hostinger Emergency Rollback

Last updated: `2026-04-19`

This runbook is for fast rollback on the current `mikroliving.id` Hostinger VPS when a release is already live and verification fails.

Use this only for emergency recovery.
For routine deploys, use [HOSTINGER_RELEASE_CHECKLIST.md](E:\xampp\htdocs\mikro-living\deploy\HOSTINGER_RELEASE_CHECKLIST.md).

## One-command rollback

Shortcut script:

```bash
cd /opt/mikroliving-id
bash deploy/hostinger/rollback-mikroliving-id.sh --good-commit <GOOD_COMMIT>
```

The rollback script checks out the target commit in detached HEAD on purpose, rebuilds, restarts PM2, restarts LiteSpeed, and verifies the live endpoints.

## Goal

Restore the last known good application release quickly and safely.

This runbook assumes:

- app path is `/opt/mikroliving-id`
- PM2 process names are:
  - `mikroliving-id-api`
  - `mikroliving-id-web`
- reverse proxy is LiteSpeed / OpenLiteSpeed

## Hard stop checks

Before rollback, check these first:

1. If `git status --short` shows unexpected local file edits on the VPS, stop and inspect before switching commits.
2. If the failed release changed the database schema in a non-backward-compatible way, app rollback alone may not be enough.
3. If production was hotfixed manually, make note of that before rollback so the fix is not lost silently.

## Fast triage

Run this first:

```bash
cd /opt/mikroliving-id
git status --short
git log --oneline -5
pm2 status
pm2 logs mikroliving-id-api --lines 60
pm2 logs mikroliving-id-web --lines 60
journalctl -u lsws -n 60 --no-pager
```

If the problem is only a bad PM2 restart or transient proxy issue, fix that first.
If the release itself is bad, continue with rollback.

## Mark the current broken release

Capture the current commit before changing anything:

```bash
cd /opt/mikroliving-id
git rev-parse HEAD
git rev-parse --short HEAD
```

Save that SHA in your incident note so we know exactly what was rolled back.

## Roll back to the last known good commit

Replace `<GOOD_COMMIT>` with the previously verified good SHA.

```bash
cd /opt/mikroliving-id
git fetch --all --tags
git checkout <GOOD_COMMIT>
npm ci
npm run build
pm2 restart mikroliving-id-api --update-env
pm2 restart mikroliving-id-web --update-env
pm2 save
systemctl restart lsws
```

## Verification after rollback

Run these checks immediately:

```bash
pm2 status

curl -k -I --resolve mikroliving.id:443:127.0.0.1 \
  https://mikroliving.id

curl -k -I --resolve www.mikroliving.id:443:127.0.0.1 \
  https://www.mikroliving.id

curl -k --resolve www.mikroliving.id:443:127.0.0.1 \
  https://www.mikroliving.id/api/v1/health

curl -k -I --resolve www.mikroliving.id:443:127.0.0.1 \
  https://www.mikroliving.id/cms
```

Expected result:

- `mikroliving.id` returns `301` to `https://www.mikroliving.id/`
- `www.mikroliving.id` returns `200`
- `/api/v1/health` returns healthy JSON
- `/cms` without session cookie returns `307` to `/login?redirect=%2Fcms`

## If database schema changed

Do not blindly run migrations during rollback.

Use this decision rule:

- If the old app version is still compatible with the current schema, roll back only the app.
- If the release included a breaking schema change, restore the last known good database backup before declaring the rollback complete.

At minimum, confirm these before closing the incident:

- login still works
- logout still works
- CMS guard still redirects unauthenticated traffic
- content reads and writes still work for the affected feature

## If `npm ci` fails during rollback

Use this fallback only if you accept dependency refresh on the server:

```bash
cd /opt/mikroliving-id
npm install
npm run build
pm2 restart mikroliving-id-api --update-env
pm2 restart mikroliving-id-web --update-env
pm2 save
systemctl restart lsws
```

## After the incident

1. Record:
   - broken commit SHA
   - restored good commit SHA
   - whether DB rollback was needed
2. Backport any emergency VPS-only fix into the main repo.
3. Do not redeploy the broken commit until the root cause is fixed and re-verified.

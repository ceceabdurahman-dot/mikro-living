# Hostinger Release Checklist

Last updated: `2026-04-19`

This is the short, repeatable release flow for the current `mikroliving.id` production stack on Hostinger VPS.

Use this checklist for normal releases.
Use `deploy/HOSTINGER_VPS_MIKROLIVING_ID_FINAL.md` for full restore, migration, or server rebuild work.
Use [HOSTINGER_EMERGENCY_ROLLBACK.md](E:\xampp\htdocs\mikro-living\deploy\HOSTINGER_EMERGENCY_ROLLBACK.md) if a live release must be reversed quickly.

## One-command release

Shortcut script:

```bash
cd /opt/mikroliving-id
bash deploy/hostinger/release-mikroliving-id.sh
```

If the release includes migrations:

```bash
cd /opt/mikroliving-id
bash deploy/hostinger/release-mikroliving-id.sh --with-migrate
```

## Current production assumptions

- App directory: `/opt/mikroliving-id`
- Canonical URL: `https://www.mikroliving.id`
- PM2 process names:
  - `mikroliving-id-api`
  - `mikroliving-id-web`
- Reverse proxy: OpenLiteSpeed / LiteSpeed

## Before release

1. Make sure the fix already exists in the main repo, not only as a manual VPS hotfix.
2. If the release changes database schema, prepare the migration first.
3. If the release is risky, take a quick config backup on the VPS:

```bash
tar czf /root/backup-mikroliving-id-config-$(date +%F-%H%M).tgz \
  /opt/mikroliving-id/.env.production \
  /root/.pm2/dump.pm2 \
  /usr/local/lsws/conf/vhosts/mikroliving-id/vhconf.conf
```

## Standard release

Run this on the VPS:

```bash
cd /opt/mikroliving-id
git status --short
git pull --ff-only
npm ci
npm run build
pm2 restart mikroliving-id-api --update-env
pm2 restart mikroliving-id-web --update-env
pm2 save
systemctl restart lsws
```

The release script above runs the same flow and also performs live verification.

## If the release includes DB changes

Run the migration after dependencies are ready and before PM2 restart:

```bash
cd /opt/mikroliving-id
NODE_ENV=production node src/config/migrate.js
```

If the release also requires seed or one-time data repair, run that explicitly and document it in the release note. Do not seed production by habit.

## Verification

Run these checks immediately after deploy:

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
- `/api/v1/health` returns JSON health payload
- `/cms` without session cookie returns `307` to `/login?redirect=%2Fcms`

## If `npm ci` fails

Stop and inspect the lockfile mismatch first.

Only use this fallback if you intentionally accept a dependency refresh on the server:

```bash
cd /opt/mikroliving-id
npm install
npm run build
pm2 restart mikroliving-id-api --update-env
pm2 restart mikroliving-id-web --update-env
pm2 save
systemctl restart lsws
```

## If verification fails

1. Stop and do not keep retrying blindly.
2. Inspect:

```bash
pm2 logs mikroliving-id-api --lines 100
pm2 logs mikroliving-id-web --lines 100
journalctl -u lsws -n 100 --no-pager
```

3. If needed, roll back to the last known good commit, then rebuild and restart.
   Use [HOSTINGER_EMERGENCY_ROLLBACK.md](E:\xampp\htdocs\mikro-living\deploy\HOSTINGER_EMERGENCY_ROLLBACK.md).

## Never do this

- Do not hot-edit production files unless it is an emergency.
- Do not run `seed.js` on production without a clear reason.
- Do not skip verification after restart.
- Do not leave critical fixes only on the VPS without backporting them to the repo.

## Recommended follow-up after the auth incident

Rotate any production password that was typed in plain text during troubleshooting, especially the admin CMS password.

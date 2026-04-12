# Mikro Living V2 VPS Deploy Runbook

Last updated: `2026-04-11`

This runbook prepares a parallel production deployment for `mikro-living-v2` on the Hostinger VPS while keeping the current `mikroliving.id` stack online until cutover.

## Target naming

- App name: `mikro-living-v2`
- Database: `u659924432_mikro_living_v2`
- Database user: `u659924432_adminML_v2`
- Canonical URL: `https://www.mikroliving.id`

## Safe parallel runtime layout

Use new ports so V2 can run beside the current production stack:

- App code: `/opt/mikro-living-v2`
- Frontend: `127.0.0.1:3200`
- API: `127.0.0.1:5200`
- PM2 API process: `mikro-living-v2-api`
- PM2 web process: `mikro-living-v2-web`

This keeps the current stack on `3100/5100` intact until cutover.

## Files prepared in this repo

- Env template: `.env.production.mikro-living-v2.example`
- PM2 ecosystem: `ecosystem.hostinger.v2.cjs`
- SQL bootstrap: `deploy/sql/mikro-living-v2.sql`

## 1. Provision app directory

```bash
mkdir -p /opt/mikro-living-v2
```

Copy the current release into `/opt/mikro-living-v2`.

## 2. Create production env

Create `/opt/mikro-living-v2/.env.production` from `.env.production.mikro-living-v2.example`.

Required values:

- `APP_NAME=mikro-living-v2`
- `PORT=5200`
- `DB_NAME=u659924432_mikro_living_v2`
- `DB_USER=u659924432_adminML_v2`
- `DB_PASSWORD=<strong password>`
- `NEXT_PUBLIC_SITE_URL=https://www.mikroliving.id`
- `NEXT_PUBLIC_API_URL=https://www.mikroliving.id/api/v1`
- `SITE_URL=https://www.mikroliving.id`

## 3. Create the new database and user

Option A, with the prepared SQL file:

```bash
mysql -u root -p < deploy/sql/mikro-living-v2.sql
```

Option B, inline:

```bash
mysql <<'SQL'
CREATE DATABASE IF NOT EXISTS `u659924432_mikro_living_v2` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DROP USER IF EXISTS 'u659924432_adminML_v2'@'localhost';
DROP USER IF EXISTS 'u659924432_adminML_v2'@'127.0.0.1';
CREATE USER 'u659924432_adminML_v2'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';
CREATE USER 'u659924432_adminML_v2'@'127.0.0.1' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON `u659924432_mikro_living_v2`.* TO 'u659924432_adminML_v2'@'localhost';
GRANT ALL PRIVILEGES ON `u659924432_mikro_living_v2`.* TO 'u659924432_adminML_v2'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL
```

## 4. Build and migrate V2

```bash
cd /opt/mikro-living-v2
npm install
npm run build:web
NODE_ENV=production node src/config/migrate.js
```

## 5. Start the V2 PM2 processes

Option A:

```bash
cd /opt/mikro-living-v2
NODE_ENV=production pm2 start scripts/start-api.js --name mikro-living-v2-api --update-env
NODE_ENV=production pm2 start ./node_modules/next/dist/bin/next --name mikro-living-v2-web -- start -H 127.0.0.1 -p 3200
pm2 save
```

Option B:

```bash
cd /opt/mikro-living-v2
pm2 start ecosystem.hostinger.v2.cjs
pm2 save
```

## 6. Verify V2 before cutover

```bash
curl http://127.0.0.1:5200/api/v1/health
curl -I http://127.0.0.1:3200
```

Expected:

- API returns JSON health
- Web returns `200`

## 7. Cutover in OpenLiteSpeed

Keep the current domain and vhost mapping. Only switch the proxy targets inside the `mikroliving-id` vhost.

Change:

- web proxy from `127.0.0.1:3100` -> `127.0.0.1:3200`
- API proxy from `127.0.0.1:5100` -> `127.0.0.1:5200`

Then reload OLS:

```bash
sudo systemctl restart lsws
```

## 8. Verify public traffic after cutover

```bash
curl -kI --resolve mikroliving.id:443:127.0.0.1 https://mikroliving.id
curl -kI --resolve www.mikroliving.id:443:127.0.0.1 https://www.mikroliving.id
curl -k --resolve www.mikroliving.id:443:127.0.0.1 https://www.mikroliving.id/api/v1/health
```

Expected:

- `mikroliving.id` -> `301` to `https://www.mikroliving.id/`
- `www.mikroliving.id` -> `200`
- `/api/v1/health` -> JSON health payload from V2

## 9. Rollback

If V2 has a problem after cutover:

1. Point OLS proxy targets back to:
   - web `127.0.0.1:3100`
   - API `127.0.0.1:5100`
2. Restart OLS:

```bash
sudo systemctl restart lsws
```

The old production stack should recover immediately.

## 10. Final cleanup after V2 is stable

Only after V2 has been stable long enough:

- stop old PM2 processes
- archive `/opt/mikroliving-id`
- keep database backups for both old and new databases

Suggested backup targets:

- `/opt/mikro-living-v2/.env.production`
- `u659924432_mikro_living_v2`
- `/usr/local/lsws/conf/httpd_config.conf`
- `/usr/local/lsws/conf/vhosts/mikroliving-id/vhconf.conf`
- `/root/.pm2/dump.pm2`

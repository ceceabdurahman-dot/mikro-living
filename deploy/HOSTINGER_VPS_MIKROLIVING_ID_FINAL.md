# MikroLiving.id VPS Deploy Runbook

Last updated: `2026-04-11`

This is the final restore / migration runbook for the `mikroliving.id` production stack on the Hostinger VPS at `151.106.124.161`.

## Production architecture

- DNS:
  - `A @ -> 151.106.124.161`
  - `CNAME www -> mikroliving.id`
- Reverse proxy: OpenLiteSpeed
- App code: `/opt/mikroliving-id`
- Frontend: Next.js on `127.0.0.1:3100`
- API: Node.js / Express on `127.0.0.1:5100`
- Process manager: PM2
- Database: MySQL on `127.0.0.1:3306`
- Canonical URL: `https://www.mikroliving.id`
- Apex behavior: `https://mikroliving.id` redirects to `https://www.mikroliving.id/`

## OpenLiteSpeed layout

- Main config: `/usr/local/lsws/conf/httpd_config.conf`
- `mikroliving.store` stays on vhost `Example`
- `mikroliving.id` uses dedicated vhost `mikroliving-id`
- Mapping in `httpd_config.conf` must stay separated:

```txt
map                     Example mikroliving.store, www.mikroliving.store
map                     mikroliving-id mikroliving.id, www.mikroliving.id
```

Do not re-add wildcard `*` to the `Example` mapping, or `mikroliving.id` can fall back into the old site again.

## Vhost behavior for `mikroliving-id`

Config file:

- `/usr/local/lsws/conf/vhosts/mikroliving-id/vhconf.conf`

Expected runtime behavior:

- `/` -> proxy to `127.0.0.1:3100`
- `/api/v1/*` -> proxy to `127.0.0.1:5100`
- `/uploads/*` -> proxy to `127.0.0.1:5100`
- `mikroliving.id` -> `301` redirect to `www.mikroliving.id`

## PM2 processes

Start commands:

```bash
cd /opt/mikroliving-id
npm install
npm run build:web
NODE_ENV=production node src/config/migrate.js

NODE_ENV=production pm2 start scripts/start-api.js --name mikroliving-id-api --update-env
NODE_ENV=production pm2 start ./node_modules/next/dist/bin/next --name mikroliving-id-web -- start -H 127.0.0.1 -p 3100
pm2 save
```

Expected PM2 apps:

- `mikroliving-id-api`
- `mikroliving-id-web`

## Environment and database

- Production env file: `/opt/mikroliving-id/.env.production`
- API port in env: `PORT=5100`
- Site URLs in env:
  - `NEXT_PUBLIC_SITE_URL=https://www.mikroliving.id`
  - `NEXT_PUBLIC_API_URL=https://www.mikroliving.id/api/v1`
  - `SITE_URL=https://www.mikroliving.id`

Database used by production:

- Host: `127.0.0.1`
- Port: `3306`
- Database: `u659924432_mikro_living`
- User: `u659924432_adminML_id`

Do not store passwords in this runbook. Keep them only in `.env.production` and secure backups.

## SSL

Current certificate:

- Cert: `/etc/letsencrypt/live/mikroliving.id/fullchain.pem`
- Key: `/etc/letsencrypt/live/mikroliving.id/privkey.pem`
- SANs:
  - `mikroliving.id`
  - `www.mikroliving.id`
- Expiry: `2026-07-10`

The current certificate was issued with manual DNS challenge, so it does **not** auto-renew yet.

## Minimum backup set

Back up these paths before major changes, migrations, or server replacement:

- `/usr/local/lsws/conf/httpd_config.conf`
- `/usr/local/lsws/conf/vhosts/mikroliving-id/vhconf.conf`
- `/opt/mikroliving-id/.env.production`
- `/root/.pm2/dump.pm2`
- `/etc/letsencrypt/live/mikroliving.id`
- `/etc/letsencrypt/archive/mikroliving.id`
- `/etc/letsencrypt/renewal/mikroliving.id.conf`

One-shot backup archive:

```bash
tar czf /root/backup-mikroliving-id-config-$(date +%F).tgz \
  /usr/local/lsws/conf/httpd_config.conf \
  /usr/local/lsws/conf/vhosts/mikroliving-id/vhconf.conf \
  /opt/mikroliving-id/.env.production \
  /root/.pm2/dump.pm2 \
  /etc/letsencrypt/live/mikroliving.id \
  /etc/letsencrypt/archive/mikroliving.id \
  /etc/letsencrypt/renewal/mikroliving.id.conf
```

## Restore / move-to-new-server checklist

1. Provision Hostinger VPS with Ubuntu + OpenLiteSpeed.
2. Point DNS:
   - `A @ -> new VPS IP`
   - `CNAME www -> mikroliving.id`
3. Copy application to `/opt/mikroliving-id`.
4. Restore `.env.production`.
5. Restore MySQL database and grants.
6. Restore or reissue SSL for `mikroliving.id` and `www.mikroliving.id`.
7. Restore OLS configs:
   - `httpd_config.conf`
   - `vhconf.conf`
8. Run:

```bash
cd /opt/mikroliving-id
npm install
npm run build:web
NODE_ENV=production node src/config/migrate.js
NODE_ENV=production pm2 start scripts/start-api.js --name mikroliving-id-api --update-env
NODE_ENV=production pm2 start ./node_modules/next/dist/bin/next --name mikroliving-id-web -- start -H 127.0.0.1 -p 3100
pm2 save
sudo systemctl restart lsws
```

## Verification

Internal checks on the VPS:

```bash
curl http://127.0.0.1:5100/api/v1/health
curl -I http://127.0.0.1:3100
curl -kI --resolve mikroliving.id:443:127.0.0.1 https://mikroliving.id
curl -kI --resolve www.mikroliving.id:443:127.0.0.1 https://www.mikroliving.id
curl -k --resolve www.mikroliving.id:443:127.0.0.1 https://www.mikroliving.id/api/v1/health
```

Expected results:

- `mikroliving.id` -> `301` to `https://www.mikroliving.id/`
- `www.mikroliving.id` -> `200`
- `/api/v1/health` -> JSON health payload

## Safest SSL auto-renew plan

After public traffic is fully stable, migrate the current manual certificate to `certbot --webroot`.

Recommended path:

1. Add a rewrite bypass for `/.well-known/acme-challenge/` in `vhconf.conf`.
2. Create webroot:

```bash
mkdir -p /usr/local/lsws/mikroliving-id/html/.well-known/acme-challenge
```

3. Reissue the existing certificate with webroot:

```bash
certbot certonly --webroot \
  -w /usr/local/lsws/mikroliving-id/html \
  -d mikroliving.id \
  -d www.mikroliving.id \
  --cert-name mikroliving.id \
  --force-renewal
```

4. Add a deploy hook to reload OpenLiteSpeed after renew.
5. Confirm with:

```bash
certbot renew --dry-run
```

Do not delete the current working certificate until the webroot-based renewal passes `--dry-run`.

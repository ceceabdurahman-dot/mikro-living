# MikroLiving Recovery Runbook

Use this runbook when `mikroliving.id/api/v1/*` starts returning `503`, `api.mikroliving.id` returns `403` or `404`, or the live frontend can no longer reach the production API.

## Expected healthy topology

- `https://mikroliving.id` -> Hostinger Node.js frontend
- `https://mikroliving.id/api/v1/*` -> Next.js same-domain proxy
- `https://api.mikroliving.id/api/v1/*` -> OpenLiteSpeed reverse proxy
- `http://127.0.0.1:5100/api/v1/*` -> PM2 backend process
- MySQL -> local or managed database used by the backend

## 1. Quick triage

Run these checks first:

```bash
pm2 ls
pm2 logs mikroliving-id-api --lines 50 --nostream
curl -i http://127.0.0.1:5100/api/v1/health
curl -i https://api.mikroliving.id/api/v1/health
curl -i https://mikroliving.id/api/v1/health
```

Interpretation:

- `127.0.0.1:5100` is down: backend or database issue
- local backend is `200`, but `api.mikroliving.id` is failing: OpenLiteSpeed or SSL issue
- `api.mikroliving.id` is `200`, but `mikroliving.id` is `503`: frontend runtime or env issue

## 2. Backend and database checks

The backend should be online in PM2:

```bash
pm2 describe mikroliving-id-api
ss -ltnp | grep -E ':5100|:3306'
curl -i http://127.0.0.1:5100/api/v1/health
```

Common bootstrap error:

```text
Access denied for user '...'
```

If that appears, verify the backend database credentials and wait-for-db logic before investigating OpenLiteSpeed.

## 3. SSL checks for `api.mikroliving.id`

Verify the certificate:

```bash
certbot certificates
openssl x509 -in /etc/letsencrypt/live/api.mikroliving.id/fullchain.pem -noout -subject -issuer -ext subjectAltName
```

Expected SAN:

```text
DNS:api.mikroliving.id
```

If the certificate does not exist, issue one:

```bash
systemctl stop lsws
certbot certonly --standalone -d api.mikroliving.id
systemctl start lsws
```

## 4. OpenLiteSpeed config checks

Inspect the active mapping and API vhost:

```bash
grep -R "api.mikroliving.id" /usr/local/lsws/conf 2>/dev/null
sed -n '/virtualhost api.mikroliving.id {/,/}/p' /usr/local/lsws/conf/httpd_config.conf
sed -n '1,220p' /usr/local/lsws/conf/vhosts/api.mikroliving.id/vhconf.conf
```

Expected `virtualhost` block:

```text
virtualhost api.mikroliving.id {
  vhRoot                  /usr/local/lsws/api.mikroliving.id/
  configFile              conf/vhosts/api.mikroliving.id/vhconf.conf
  allowSymbolLink         1
  enableScript            1
  restrained              0
}
```

Expected listener mapping:

```text
map                     api.mikroliving.id api.mikroliving.id
```

Bad mapping that must be removed:

```text
map                     Example api.mikroliving.id
```

## 5. OpenLiteSpeed API vhost config

The API vhost root must exist:

```bash
mkdir -p /usr/local/lsws/api.mikroliving.id/{html,logs}
chown -R nobody:nogroup /usr/local/lsws/api.mikroliving.id
chmod -R 755 /usr/local/lsws/api.mikroliving.id
```

Working `vhconf.conf`:

```apache
docRoot                   $VH_ROOT/html/
enableGzip                1

extprocessor mikroliving_api_backend {
  type                    proxy
  address                 127.0.0.1:5100
  maxConns                100
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}

rewrite  {
  enable                  1
  autoLoadHtaccess        0
  rules                   <<<END_rules
RewriteEngine On
RewriteRule ^(.*)$ http://mikroliving_api_backend/$1 [P,L]
END_rules
}

vhssl  {
  keyFile                 /etc/letsencrypt/live/api.mikroliving.id/privkey.pem
  certFile                /etc/letsencrypt/live/api.mikroliving.id/fullchain.pem
  certChain               1
}
```

Validate and restart:

```bash
/usr/local/lsws/bin/openlitespeed -t
systemctl restart lsws
```

## 6. Public verification

After fixing OpenLiteSpeed:

```bash
curl -Ik https://api.mikroliving.id/api/v1/health
curl -i https://api.mikroliving.id/api/v1/health
curl -i https://mikroliving.id/api/v1/health
curl -i https://mikroliving.id/api/v1/projects
```

Expected:

- `https://api.mikroliving.id/api/v1/health` -> `200`
- `https://mikroliving.id/api/v1/health` -> `200`
- `https://mikroliving.id/api/v1/projects` -> not `503`

## 7. Frontend env checks

If `api.mikroliving.id` is healthy but `mikroliving.id/api/v1/*` is still `503`, verify the frontend runtime env:

```env
NEXT_PUBLIC_SITE_URL=https://mikroliving.id
NEXT_PUBLIC_API_URL=https://mikroliving.id/api/v1
API_URL=https://api.mikroliving.id/api/v1
API_PROXY_TARGET=
```

Then restart or redeploy the frontend app that actually serves `mikroliving.id`.

## 8. Logs to inspect

```bash
tail -n 100 /usr/local/lsws/logs/error.log
tail -n 100 /usr/local/lsws/logs/access.log
pm2 logs mikroliving-id-api --lines 100 --nostream
pm2 logs mikroliving-id-web --lines 100 --nostream
```

Useful patterns:

- `Path for vhost root is not accessible` -> OLS vhost root missing or wrong permissions
- `SSL altname invalid` -> wrong certificate attached to API subdomain
- `403 Forbidden` default LiteSpeed page -> listener mapping is correct, proxy not active
- `404 Not Found` default LiteSpeed page -> vhost is matched, but root/proxy config is incomplete
- `The backend API is unreachable right now.` -> same-domain frontend proxy cannot reach backend origin

## 9. Follow-up cleanup

After recovery, consider these cleanups:

- remove or fix unrelated `Example` vhost errors in OpenLiteSpeed
- keep backups of `httpd_config.conf` and `conf/vhosts/api.mikroliving.id/vhconf.conf`
- update the PM2 frontend process to use `node scripts/start-web.js` instead of `next start`
- document any final production env values in your server inventory

For the API subdomain setup details, see [deploy/openlitespeed/api.mikroliving.id.md](/D:/Cece%20Abdurahman/Bisnis/Interior/mikro-living/mikro-living/deploy/openlitespeed/api.mikroliving.id.md).

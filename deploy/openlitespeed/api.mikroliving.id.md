# `api.mikroliving.id` on OpenLiteSpeed

Use this when the backend API runs on the Hostinger VPS and the public frontend stays on Hostinger hPanel.

## Target topology

- `https://mikroliving.id` -> Hostinger Node.js frontend
- `https://api.mikroliving.id/api/v1` -> OpenLiteSpeed vhost -> backend on `127.0.0.1:5100`
- `https://mikroliving.id/api/v1` -> internal Next.js proxy route -> `https://api.mikroliving.id/api/v1`

## 1. DNS

Create a DNS `A` record:

- `Host`: `api`
- `Points to`: `187.127.97.209`
- `TTL`: default

Verify:

```bash
nslookup api.mikroliving.id
```

## 2. OpenLiteSpeed listener + SSL

In OpenLiteSpeed WebAdmin:

1. Ensure an HTTPS listener exists on port `443`.
2. Map a dedicated virtual host for `api.mikroliving.id`.
3. Attach the certificate issued for `api.mikroliving.id`.

Typical certificate paths:

```text
/etc/letsencrypt/live/api.mikroliving.id/privkey.pem
/etc/letsencrypt/live/api.mikroliving.id/fullchain.pem
```

## 3. Reverse proxy to the backend

Create a Web Server external application:

- `Name`: `mikroliving_api_backend`
- `Address`: `127.0.0.1:5100`
- `Max Connections`: `100`
- `Initial Request Timeout`: `60`
- `Retry Timeout`: `0`
- `Response Buffering`: `No`

Then proxy the `api.mikroliving.id` vhost to that backend, either with a Proxy context for `/` or a rewrite rule:

```text
RewriteRule ^(.*)$ http://mikroliving_api_backend/$1 [P,L]
```

## 4. Verify backend + subdomain

```bash
curl -I http://127.0.0.1:5100/api/v1/health
curl -I https://api.mikroliving.id/api/v1/health
curl -i https://api.mikroliving.id/api/v1/health
```

## 5. Hostinger hPanel frontend env

```env
NEXT_PUBLIC_SITE_URL=https://mikroliving.id
NEXT_PUBLIC_API_URL=https://mikroliving.id/api/v1
API_URL=https://api.mikroliving.id/api/v1
API_PROXY_TARGET=
```

Redeploy the frontend, then verify:

```bash
curl -I https://mikroliving.id/
curl -I https://mikroliving.id/api/v1/health
curl -i https://mikroliving.id/api/v1/health
```

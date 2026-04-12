# Hostinger VPS LiteSpeed Deployment

This guide prepares the project for **Hostinger VPS Hosting** using the **Ubuntu 22.04 + Node.js + OpenLiteSpeed** template that Hostinger documents for VPS Node.js deployments, with OpenLiteSpeed reverse proxying to:

- Next.js frontend on `127.0.0.1:3000`
- Express API on `127.0.0.1:5000`

References:

- Hostinger Node.js on VPS: [Node.js is supported on Hostinger VPS, and Hostinger recommends the Ubuntu 22.04 + Node.js + OpenLiteSpeed template](https://support.hostinger.com/en/articles/1583661-is-node-js-supported-at-hostinger)
- OpenLiteSpeed reverse proxy: [Reverse Proxy](https://docs.openlitespeed.org/config/reverseproxy/)
- OpenLiteSpeed external app setup: [Configure via External App](https://docs.openlitespeed.org/config/php/externalapp/)
- LiteSpeed rewrite proxy examples: [Rewrite Rule Proxy](https://docs.litespeedtech.com/lsws/cp/cpanel/rewrite-proxy/)

## Files prepared in this repo

- Env template: [\.env.production.hostinger-vps.example](E:\xampp\htdocs\mikro-living\.env.production.hostinger-vps.example)
- PM2 ecosystem: [ecosystem.hostinger.cjs](E:\xampp\htdocs\mikro-living\ecosystem.hostinger.cjs)
- LiteSpeed rewrite rules: [deploy/hostinger/mikroliving-litespeed-rewrite.conf](E:\xampp\htdocs\mikro-living\deploy\hostinger\mikroliving-litespeed-rewrite.conf)
- Bootstrap script: [deploy/hostinger/deploy-hostinger-vps-litespeed.sh](E:\xampp\htdocs\mikro-living\deploy\hostinger\deploy-hostinger-vps-litespeed.sh)

## Recommended Hostinger VPS image

Choose the Hostinger VPS template that includes:

- `Ubuntu 22.04`
- `Node.js`
- `OpenLiteSpeed`

This is the template Hostinger explicitly recommends for Node.js apps on VPS.

## DNS checklist for `mikroliving.id`

Use `www.mikroliving.id` as the primary domain.

Create these DNS records at your DNS provider:

- `A` record for `@` -> `<IP_VPS_ANDA>`
- `A` record for `www` -> `<IP_VPS_ANDA>`

Checklist before continuing:

1. `mikroliving.id` resolves to the VPS IP.
2. `www.mikroliving.id` resolves to the VPS IP.
3. Wait until propagation is complete before requesting SSL.

You can verify with:

```bash
dig +short mikroliving.id
dig +short www.mikroliving.id
```

Or:

```bash
nslookup mikroliving.id
nslookup www.mikroliving.id
```

## Deployment flow

1. Create the VPS with the Hostinger template above.
2. Point your domain to the VPS IP.
3. Upload/extract the project into `/var/www/mikroliving`.
4. SSH into the server and run:

```bash
cd /var/www/mikroliving
chmod +x deploy/hostinger/deploy-hostinger-vps-litespeed.sh
./deploy/hostinger/deploy-hostinger-vps-litespeed.sh
```

5. If `.env.production` was created from the template, fill it with real values before starting PM2:

```bash
cp .env.production.hostinger-vps.example .env.production
nano .env.production
```

6. Fill `.env.production` with real values:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`
- `DB_*`
- `JWT_*`
- `CLOUDINARY_*`
- `SMTP_*`
- `ALLOWED_ORIGINS`

7. Run migrations:

```bash
NODE_ENV=production node src/config/migrate.js
```

8. Optionally seed starter data:

```bash
NODE_ENV=production node src/config/seed.js
```

9. Start the processes:

```bash
pm2 start ecosystem.hostinger.cjs
pm2 save
```

## PM2 processes

The prepared PM2 stack runs:

- `mikroliving-api` -> [scripts/start-api.js](E:\xampp\htdocs\mikro-living\scripts\start-api.js)
- `mikroliving-web` -> `next start -H 127.0.0.1 -p 3000`

This intentionally uses `next start`, not the local helper script, so the VPS runtime stays aligned with standard production Next.js behavior.

The API/bootstrap scripts also now load `.env.production` automatically when `NODE_ENV=production`, so PM2, migrations, and startup all read the same production env file consistently.

## LiteSpeed / OpenLiteSpeed routing

First create two OpenLiteSpeed External Apps with type `Web Server`:

- `mikroliving-web` -> `127.0.0.1:3000`
- `mikroliving-api` -> `127.0.0.1:5000`

Then apply the rewrite rules from [deploy/hostinger/mikroliving-litespeed-rewrite.conf](E:\xampp\htdocs\mikro-living\deploy\hostinger\mikroliving-litespeed-rewrite.conf) to your virtual host or `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^mikroliving\.id$ [NC]
RewriteRule ^(.*)$ https://www.mikroliving.id/$1 [R=301,L]
RewriteRule ^/api/v1/(.*)$ http://mikroliving-api/api/v1/$1 [P,L]
RewriteRule ^/uploads/(.*)$ http://mikroliving-api/uploads/$1 [P,L]
RewriteCond %{REQUEST_URI} !^/api/v1/
RewriteCond %{REQUEST_URI} !^/uploads/
RewriteRule ^(.*)$ http://mikroliving-web/$1 [P,L]
```

This follows OpenLiteSpeed's documented reverse-proxy pattern using External Apps plus rewrite rules with the `[P]` flag.

## OpenLiteSpeed panel checklist

1. Enable rewrite rules for the vhost.
2. Create the two `Web Server` external apps named above.
3. Map your domain to the listener on ports `80` and `443`.
4. Add SSL from the Hostinger/LiteSpeed panel.
5. Paste the rewrite rules above into the vhost rewrite section or `.htaccess`.

## Certbot + OpenLiteSpeed commands

Hostinger recommends installing SSL on VPS only after the domain is fully pointed to the VPS. For an OpenLiteSpeed VPS, the most direct manual approach is to request the certificate with Certbot and then point OpenLiteSpeed to the generated files.

Install Certbot the Hostinger-supported way:

```bash
sudo apt update
sudo apt install -y python3 python3-venv libaugeas0
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot
sudo ln -sf /opt/certbot/bin/certbot /usr/bin/certbot
```

Issue the certificate for both hosts:

```bash
sudo systemctl stop lsws
sudo certbot certonly --standalone \
  -d mikroliving.id \
  -d www.mikroliving.id \
  --agree-tos \
  -m marketing@mikroliving.id \
  --non-interactive
sudo systemctl start lsws
```

Use these certificate paths inside OpenLiteSpeed:

- Private Key File: `/etc/letsencrypt/live/mikroliving.id/privkey.pem`
- Certificate File: `/etc/letsencrypt/live/mikroliving.id/fullchain.pem`
- Chained Certificate: `Yes`

After updating the SSL settings in OpenLiteSpeed, restart OLS:

```bash
sudo systemctl restart lsws
```

Recommended renewal command:

```bash
sudo crontab -e
```

Add:

```cron
0 3 * * * systemctl stop lsws && certbot renew --quiet && systemctl start lsws
```

Then verify:

```bash
openssl s_client -connect mikroliving.id:443 -servername mikroliving.id </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
openssl s_client -connect www.mikroliving.id:443 -servername www.mikroliving.id </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

## Verify after deploy

Run these on the VPS:

```bash
pm2 status
curl http://127.0.0.1:5000/api/v1/health
curl -I http://127.0.0.1:3000
```

Then verify in the browser:

- `https://your-domain.com`
- `https://your-domain.com/login`
- `https://your-domain.com/cms`
- `https://your-domain.com/api/v1/health`

## Notes

- If you use a managed MySQL service instead of a local DB on the VPS, only change the `DB_*` values in [\.env.production.hostinger-vps.example](E:\xampp\htdocs\mikro-living\.env.production.hostinger-vps.example).
- If you need `/uploads` served through the same domain, keep the rewrite rule for `/uploads`.
- The bootstrap script will skip `pm2 start` if `.env.production` still contains obvious placeholder values such as `your-domain.com` or `change_me`.
- If LiteSpeed is configured through Hostinger's panel rather than the WebAdmin console directly, the same reverse-proxy structure still applies; the place you create the external apps and paste the rewrite rules may differ.
- Canonical production host in this setup is `https://www.mikroliving.id`, while `https://mikroliving.id` should redirect to `https://www.mikroliving.id`.

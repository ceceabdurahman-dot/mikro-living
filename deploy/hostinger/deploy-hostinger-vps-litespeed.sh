#!/usr/bin/env bash
set -euo pipefail

APP_NAME="mikroliving"
APP_DIR="/var/www/mikroliving"
DOMAIN="your-domain.com"
WWW_DOMAIN="www.your-domain.com"
NODE_MAJOR="20"
SITE_USER="${SUDO_USER:-$USER}"
ENV_SOURCE=".env.production.hostinger-vps.example"

echo "==> Preparing Hostinger VPS (Ubuntu + LiteSpeed/OpenLiteSpeed) for ${APP_NAME}"

sudo apt update
sudo apt install -y curl unzip git mysql-client certbot

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

sudo mkdir -p "$APP_DIR"
sudo chown -R "$SITE_USER":"$SITE_USER" "$APP_DIR"

cd "$APP_DIR"

if [ ! -f package.json ]; then
  echo "package.json not found in $APP_DIR"
  echo "Upload/extract the project to $APP_DIR first, then re-run this script."
  exit 1
fi

if [ ! -f .env.production ]; then
  cp "$ENV_SOURCE" .env.production
  sed -i "s|https://your-domain.com|https://$DOMAIN|g" .env.production
  sed -i "s|https://www.your-domain.com|https://$WWW_DOMAIN|g" .env.production
fi

has_placeholder_env() {
  grep -Eq 'your-domain\.com|change_me|change_this_' .env.production
}

echo "==> Installing dependencies"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "==> Building Next.js frontend"
npm run build:web

PM2_STARTUP_OUTPUT="PM2 startup was skipped because .env.production still contains placeholder values."

if has_placeholder_env; then
  echo "==> Placeholder values still found in .env.production"
  echo "==> Skipping PM2 start until production secrets and domain values are filled."
else
  echo "==> Restarting PM2 apps"
  pm2 delete mikroliving-api >/dev/null 2>&1 || true
  pm2 delete mikroliving-web >/dev/null 2>&1 || true
  pm2 start ecosystem.hostinger.cjs
  pm2 save
  pm2 startup systemd -u "$SITE_USER" --hp "/home/$SITE_USER" >/tmp/mikroliving-pm2-startup.txt
  PM2_STARTUP_OUTPUT="$(cat /tmp/mikroliving-pm2-startup.txt)"
fi

cat <<INFO

Deployment bootstrap complete.

Next manual steps:
1. Edit $APP_DIR/.env.production with the real DB, JWT, Cloudinary, SMTP, and domain values.
2. Run migrations if needed:
   cd $APP_DIR && NODE_ENV=production node src/config/migrate.js
3. Seed starter data if needed:
   cd $APP_DIR && NODE_ENV=production node src/config/seed.js
4. In OpenLiteSpeed, create two External Apps of type "Web Server":
   - mikroliving-web -> 127.0.0.1:3000
   - mikroliving-api -> 127.0.0.1:5000
5. In LiteSpeed / OpenLiteSpeed, point your domain to this VPS and add the rewrite rules from:
   $APP_DIR/deploy/hostinger/mikroliving-litespeed-rewrite.conf
6. If PM2 start was skipped because placeholders remain, run this after updating .env.production:
   cd $APP_DIR && pm2 start ecosystem.hostinger.cjs && pm2 save
7. Ensure the backend is listening on 127.0.0.1:5000 and Next.js on 127.0.0.1:3000:
   pm2 status
   curl http://127.0.0.1:5000/api/v1/health
   curl -I http://127.0.0.1:3000
8. Enable SSL for $DOMAIN and $WWW_DOMAIN from LiteSpeed/Hostinger panel.

PM2 startup command output:
$PM2_STARTUP_OUTPUT

INFO

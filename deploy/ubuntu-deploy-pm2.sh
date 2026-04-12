#!/usr/bin/env bash
set -euo pipefail

APP_NAME="mikroliving"
APP_DIR="/var/www/mikroliving"
DOMAIN="your-domain.com"
WWW_DOMAIN="www.your-domain.com"
DB_NAME="mikro-living_db"
DB_USER="mikroliving_user"
DB_PASSWORD="change_me"
JWT_SECRET="change_this_to_a_long_random_secret"

sudo apt update
sudo apt install -y nginx unzip mysql-client curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER":"$USER" "$APP_DIR"

cd "$APP_DIR"

echo "Upload and extract mikroliving-website-*.zip into $APP_DIR before continuing if files are not here yet."

if [ ! -f package.json ]; then
  echo "package.json not found in $APP_DIR"
  exit 1
fi

cp .env.production.template .env.production
sed -i "s|your-domain.com|$DOMAIN|g" .env.production
sed -i "s|www.your-domain.com|$WWW_DOMAIN|g" .env.production
sed -i "s|DB_NAME=mikro-living_db|DB_NAME=$DB_NAME|" .env.production
sed -i "s|DB_USER=mikroliving_user|DB_USER=$DB_USER|" .env.production
sed -i "s|DB_PASSWORD=change_me|DB_PASSWORD=$DB_PASSWORD|" .env.production
sed -i "s|JWT_SECRET=change_this_to_a_long_random_secret|JWT_SECRET=$JWT_SECRET|" .env.production

npm install
npm run build:web

pm2 delete mikroliving-api >/dev/null 2>&1 || true
pm2 delete mikroliving-web >/dev/null 2>&1 || true
pm2 start ecosystem.hostinger.cjs
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME"

sudo tee /etc/nginx/sites-available/mikroliving >/dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    location /api/v1/ {
        proxy_pass http://127.0.0.1:5000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mikroliving /etc/nginx/sites-enabled/mikroliving
sudo nginx -t
sudo systemctl restart nginx

cat <<INFO

Deployment selesai.

Langkah berikutnya:
1. Import file SQL ke database $DB_NAME
2. Ubah nilai Cloudinary dan secret lain di .env.production
3. Pasang SSL:
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN
4. Verifikasi:
   pm2 status
   curl -I http://127.0.0.1:5000/api/v1/health
   curl -I http://127.0.0.1:3001

INFO

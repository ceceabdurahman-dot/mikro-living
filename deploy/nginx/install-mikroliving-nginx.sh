#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-$(pwd)}"
SOURCE_CONF="$REPO_DIR/deploy/nginx/mikroliving.id.conf"
TARGET_CONF="/etc/nginx/sites-available/mikroliving.id.conf"
TARGET_LINK="/etc/nginx/sites-enabled/mikroliving.id.conf"
CERT_PATH="/etc/letsencrypt/live/mikroliving.id/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/mikroliving.id/privkey.pem"

if [[ ! -f "$SOURCE_CONF" ]]; then
  echo "Missing source config: $SOURCE_CONF" >&2
  exit 1
fi

if [[ ! -d /etc/nginx/sites-available || ! -d /etc/nginx/sites-enabled ]]; then
  echo "This script expects an Nginx layout with /etc/nginx/sites-available and sites-enabled." >&2
  exit 1
fi

if [[ ! -f "$CERT_PATH" || ! -f "$KEY_PATH" ]]; then
  echo "TLS certificate files were not found at the paths referenced by deploy/nginx/mikroliving.id.conf." >&2
  echo "Update the config first if your certificate paths are different." >&2
  exit 1
fi

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

$SUDO cp "$SOURCE_CONF" "$TARGET_CONF"
$SUDO ln -sfn "$TARGET_CONF" "$TARGET_LINK"
$SUDO nginx -t
$SUDO systemctl reload nginx

echo
echo "Nginx config installed successfully."
echo "Server-side checks:"
curl -I http://127.0.0.1:3000/ || true
curl -I http://127.0.0.1:5000/api/v1/health || true
echo
echo "Public checks:"
curl -I https://mikroliving.id/ || true
curl -I https://mikroliving.id/api/v1/health || true

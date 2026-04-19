#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./mikroliving-id-common.sh
source "$SCRIPT_DIR/mikroliving-id-common.sh"

TARGET_DIR=""
ENV_SOURCE=""
SKIP_BACKUP=false

usage() {
  cat <<'EOF'
Usage:
  bash deploy/hostinger/promote-mikroliving-id-release.sh [options]

Options:
  --target-dir PATH      Release directory to promote. Defaults to the current working directory.
  --env-source PATH      Optional source .env.production file if the target release does not have one yet.
  --skip-backup          Skip the quick config backup
  -h, --help             Show this help
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target-dir)
      [ "$#" -ge 2 ] || fail "--target-dir requires a value"
      TARGET_DIR="$2"
      shift
      ;;
    --env-source)
      [ "$#" -ge 2 ] || fail "--env-source requires a value"
      ENV_SOURCE="$2"
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
  shift
done

ensure_required_commands

if [ -z "$TARGET_DIR" ]; then
  TARGET_DIR="$PWD"
fi

[ -d "$TARGET_DIR" ] || fail "Target directory not found: $TARGET_DIR"
[ -f "$TARGET_DIR/package.json" ] || fail "package.json not found in target directory: $TARGET_DIR"

if [ ! -f "$TARGET_DIR/.env.production" ]; then
  if [ -n "$ENV_SOURCE" ] && [ -f "$ENV_SOURCE" ]; then
    cp "$ENV_SOURCE" "$TARGET_DIR/.env.production"
  elif [ -f "$CURRENT_RELEASE_LINK/.env.production" ]; then
    cp "$CURRENT_RELEASE_LINK/.env.production" "$TARGET_DIR/.env.production"
  elif [ -f "$LEGACY_APP_DIR/.env.production" ]; then
    cp "$LEGACY_APP_DIR/.env.production" "$TARGET_DIR/.env.production"
  else
    fail "Target release does not have .env.production, and no readable env source was found."
  fi
fi

APP_DIR="$TARGET_DIR"
print_release_context

if [ "$SKIP_BACKUP" != "true" ]; then
  backup_if_needed
fi

log "Switching current release symlink"
mkdir -p "$(dirname "$CURRENT_RELEASE_LINK")"
ln -sfn "$TARGET_DIR" "$CURRENT_RELEASE_LINK"
APP_DIR="$CURRENT_RELEASE_LINK"

recreate_pm2_processes
log "Restarting LiteSpeed"
systemctl_cmd restart lsws
verify_live_endpoints

log "Current release now points to $(readlink -f "$CURRENT_RELEASE_LINK")"

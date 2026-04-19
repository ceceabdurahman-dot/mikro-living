#!/usr/bin/env bash

APP_DIR="${APP_DIR:-/opt/mikroliving-id}"
API_PROCESS_NAME="${API_PROCESS_NAME:-mikroliving-id-api}"
WEB_PROCESS_NAME="${WEB_PROCESS_NAME:-mikroliving-id-web}"
APEX_HOST="${APEX_HOST:-mikroliving.id}"
SITE_HOST="${SITE_HOST:-www.mikroliving.id}"
VERIFY_IP="${VERIFY_IP:-127.0.0.1}"
WEB_BIND_HOST="${WEB_BIND_HOST:-127.0.0.1}"
WEB_PORT="${WEB_PORT:-3100}"
BUILD_SCRIPT="${BUILD_SCRIPT:-build}"
NODE_ENV_VALUE="${NODE_ENV_VALUE:-production}"

log() {
  printf '\n==> %s\n' "$*"
}

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

ensure_required_commands() {
  need_cmd git
  need_cmd npm
  need_cmd pm2
  need_cmd curl
  need_cmd tar
}

systemctl_cmd() {
  if [ "$(id -u)" -eq 0 ]; then
    systemctl "$@"
  else
    sudo systemctl "$@"
  fi
}

print_release_context() {
  log "Runtime context"
  printf 'App dir: %s\n' "$APP_DIR"
  printf 'API process: %s\n' "$API_PROCESS_NAME"
  printf 'Web process: %s\n' "$WEB_PROCESS_NAME"
  printf 'Build script: npm run %s\n' "$BUILD_SCRIPT"
  printf 'Site host: %s\n' "$SITE_HOST"
  printf 'Verify via IP: %s\n' "$VERIFY_IP"
}

current_branch() {
  git branch --show-current 2>/dev/null || true
}

assert_attached_branch() {
  local branch
  branch="$(current_branch)"
  [ -n "$branch" ] || fail "Git is in detached HEAD. Reattach to the intended tracking branch before running a normal release."
  printf '%s\n' "$branch"
}

assert_worktree_clean() {
  local allow_dirty="${1:-false}"
  local status_output

  status_output="$(git status --short)"
  if [ -n "$status_output" ] && [ "$allow_dirty" != "true" ]; then
    printf '%s\n' "$status_output" >&2
    fail "Working tree is dirty on the VPS. Stop and inspect before continuing, or rerun with --allow-dirty if you really intend to continue."
  fi
}

backup_if_needed() {
  local ts backup_file
  local targets=()

  ts="$(date +%F-%H%M%S)"
  if [ "$(id -u)" -eq 0 ]; then
    backup_file="/root/backup-mikroliving-id-config-${ts}.tgz"
  else
    backup_file="$HOME/backup-mikroliving-id-config-${ts}.tgz"
  fi

  [ -r "$APP_DIR/.env.production" ] && targets+=("$APP_DIR/.env.production")
  [ -r "/root/.pm2/dump.pm2" ] && targets+=("/root/.pm2/dump.pm2")
  [ -r "/usr/local/lsws/conf/vhosts/mikroliving-id/vhconf.conf" ] && targets+=("/usr/local/lsws/conf/vhosts/mikroliving-id/vhconf.conf")

  if [ ${#targets[@]} -eq 0 ]; then
    log "No readable quick-backup targets found; skipping backup"
    return
  fi

  tar czf "$backup_file" "${targets[@]}"
  log "Saved quick backup to $backup_file"
}

install_dependencies() {
  local allow_fallback="${1:-false}"

  if [ -f package-lock.json ]; then
    log "Installing dependencies with npm ci"
    if npm ci; then
      return
    fi

    if [ "$allow_fallback" = "true" ]; then
      log "npm ci failed; falling back to npm install"
      npm install
      return
    fi

    fail "npm ci failed. Fix the lockfile mismatch or rerun with --allow-npm-install-fallback."
  fi

  log "package-lock.json not found; using npm install"
  npm install
}

run_build() {
  log "Building application"
  npm run "$BUILD_SCRIPT"
}

run_migrations() {
  log "Running production migrations"
  NODE_ENV="$NODE_ENV_VALUE" node src/config/migrate.js
}

restart_pm2_processes() {
  log "Restarting PM2 applications"

  if pm2 describe "$API_PROCESS_NAME" >/dev/null 2>&1; then
    pm2 restart "$API_PROCESS_NAME" --update-env
  else
    NODE_ENV="$NODE_ENV_VALUE" pm2 start scripts/start-api.js --name "$API_PROCESS_NAME" --update-env
  fi

  if pm2 describe "$WEB_PROCESS_NAME" >/dev/null 2>&1; then
    pm2 restart "$WEB_PROCESS_NAME" --update-env
  else
    NODE_ENV="$NODE_ENV_VALUE" pm2 start ./node_modules/next/dist/bin/next --name "$WEB_PROCESS_NAME" -- start -H "$WEB_BIND_HOST" -p "$WEB_PORT"
  fi

  pm2 save
}

status_code() {
  curl -k -sS -o /dev/null -w '%{http_code}' "$@"
}

location_header() {
  curl -k -sS -D - -o /dev/null "$@" | awk 'tolower($1)=="location:" { sub(/\r$/, "", $2); print $2; exit }'
}

expect_status() {
  local label="$1"
  local expected="$2"
  shift 2

  local actual
  actual="$(status_code "$@")"

  if [ "$actual" != "$expected" ]; then
    fail "$label expected HTTP $expected but got $actual"
  fi

  printf 'PASS: %s -> HTTP %s\n' "$label" "$actual"
}

expect_location_contains() {
  local label="$1"
  local expected="$2"
  shift 2

  local actual
  actual="$(location_header "$@")"

  if [[ "$actual" != *"$expected"* ]]; then
    fail "$label expected Location containing '$expected' but got '${actual:-<none>}'"
  fi

  printf 'PASS: %s -> Location %s\n' "$label" "$actual"
}

verify_live_endpoints() {
  log "Verifying live endpoints"

  expect_status "Apex redirect" "301" -I --resolve "$APEX_HOST:443:$VERIFY_IP" "https://$APEX_HOST"
  expect_location_contains "Apex redirect" "https://$SITE_HOST/" -I --resolve "$APEX_HOST:443:$VERIFY_IP" "https://$APEX_HOST"

  expect_status "WWW homepage" "200" -I --resolve "$SITE_HOST:443:$VERIFY_IP" "https://$SITE_HOST"
  expect_status "API health" "200" --resolve "$SITE_HOST:443:$VERIFY_IP" "https://$SITE_HOST/api/v1/health"

  expect_status "CMS guard" "307" -I --resolve "$SITE_HOST:443:$VERIFY_IP" "https://$SITE_HOST/cms"
  expect_location_contains "CMS guard" "/login?redirect=%2Fcms" -I --resolve "$SITE_HOST:443:$VERIFY_IP" "https://$SITE_HOST/cms"

  pm2 status
}

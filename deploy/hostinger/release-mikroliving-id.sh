#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./mikroliving-id-common.sh
source "$SCRIPT_DIR/mikroliving-id-common.sh"

ALLOW_DIRTY=false
ALLOW_NPM_INSTALL_FALLBACK=false
RUN_MIGRATIONS=false
SKIP_BACKUP=false
SKIP_GIT_PULL=false

usage() {
  cat <<'EOF'
Usage:
  bash deploy/hostinger/release-mikroliving-id.sh [options]

Options:
  --with-migrate                 Run production migrations after build and before restart
  --skip-backup                  Skip the quick config backup
  --skip-git-pull                Skip git fetch/pull and release the current checkout as-is
  --allow-dirty                  Allow a dirty git worktree on the VPS
  --allow-npm-install-fallback   Fall back to npm install if npm ci fails
  --app-dir PATH                 Override the app directory (default: /opt/mikroliving-id)
  --build-script NAME            Override the npm build script name (default: build)
  -h, --help                     Show this help
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --with-migrate)
      RUN_MIGRATIONS=true
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      ;;
    --skip-git-pull)
      SKIP_GIT_PULL=true
      ;;
    --allow-dirty)
      ALLOW_DIRTY=true
      ;;
    --allow-npm-install-fallback)
      ALLOW_NPM_INSTALL_FALLBACK=true
      ;;
    --app-dir)
      [ "$#" -ge 2 ] || fail "--app-dir requires a value"
      APP_DIR="$2"
      shift
      ;;
    --build-script)
      [ "$#" -ge 2 ] || fail "--build-script requires a value"
      BUILD_SCRIPT="$2"
      shift
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

APP_DIR="$(resolve_app_dir)"
ensure_required_commands

[ -d "$APP_DIR" ] || fail "App directory not found: $APP_DIR"
cd "$APP_DIR"
[ -f package.json ] || fail "package.json not found in $APP_DIR"

print_release_context
log "Current branch: $(assert_attached_branch)"
assert_worktree_clean "$ALLOW_DIRTY"

if [ "$SKIP_BACKUP" != "true" ]; then
  backup_if_needed
fi

if [ "$SKIP_GIT_PULL" != "true" ]; then
  log "Updating source from git"
  git fetch --all --tags
  git pull --ff-only
fi

log "Current commit: $(git rev-parse --short HEAD)"
install_dependencies "$ALLOW_NPM_INSTALL_FALLBACK"
run_build

if [ "$RUN_MIGRATIONS" = "true" ]; then
  run_migrations
fi

restart_pm2_processes
log "Restarting LiteSpeed"
systemctl_cmd restart lsws
verify_live_endpoints

log "Release complete for commit $(git rev-parse --short HEAD)"

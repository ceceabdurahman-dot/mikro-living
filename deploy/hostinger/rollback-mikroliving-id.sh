#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./mikroliving-id-common.sh
source "$SCRIPT_DIR/mikroliving-id-common.sh"

ALLOW_DIRTY=false
ALLOW_NPM_INSTALL_FALLBACK=false
SKIP_BACKUP=false
SKIP_FETCH=false
GOOD_COMMIT=""

usage() {
  cat <<'EOF'
Usage:
  bash deploy/hostinger/rollback-mikroliving-id.sh --good-commit <commit-ish> [options]

Options:
  --good-commit SHA              Commit or tag to restore
  --skip-backup                  Skip the quick config backup
  --skip-fetch                   Skip git fetch before checkout
  --allow-dirty                  Allow a dirty git worktree on the VPS
  --allow-npm-install-fallback   Fall back to npm install if npm ci fails
  --app-dir PATH                 Override the app directory (default: auto-detect current release or legacy fallback)
  --build-script NAME            Override the npm build script name (default: build)
  -h, --help                     Show this help
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --good-commit)
      [ "$#" -ge 2 ] || fail "--good-commit requires a value"
      GOOD_COMMIT="$2"
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      ;;
    --skip-fetch)
      SKIP_FETCH=true
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

[ -n "$GOOD_COMMIT" ] || fail "--good-commit is required"

APP_DIR="$(resolve_app_dir)"
ensure_required_commands

[ -d "$APP_DIR" ] || fail "App directory not found: $APP_DIR"
cd "$APP_DIR"
[ -f package.json ] || fail "package.json not found in $APP_DIR"

print_release_context
assert_worktree_clean "$ALLOW_DIRTY"

if [ "$SKIP_BACKUP" != "true" ]; then
  backup_if_needed
fi

if [ "$SKIP_FETCH" != "true" ]; then
  log "Refreshing git refs"
  git fetch --all --tags
fi

git rev-parse --verify "${GOOD_COMMIT}^{commit}" >/dev/null 2>&1 || fail "Rollback target not found: $GOOD_COMMIT"

BROKEN_SHA="$(git rev-parse HEAD)"
BROKEN_SHORT="$(git rev-parse --short HEAD)"
GOOD_SHA="$(git rev-parse "${GOOD_COMMIT}^{commit}")"
GOOD_SHORT="$(git rev-parse --short "${GOOD_COMMIT}^{commit}")"

log "Broken release before rollback: $BROKEN_SHORT"
log "Rollback target: $GOOD_SHORT"
log "Checking out rollback target in detached HEAD"
git checkout --detach "$GOOD_SHA"

install_dependencies "$ALLOW_NPM_INSTALL_FALLBACK"
run_build
restart_pm2_processes
log "Restarting LiteSpeed"
systemctl_cmd restart lsws
verify_live_endpoints

log "Rollback complete"
printf 'Broken commit was: %s\n' "$BROKEN_SHA"
printf 'Restored commit is: %s\n' "$GOOD_SHA"
printf 'Note: the server is now in detached HEAD until you intentionally reattach it.\n'

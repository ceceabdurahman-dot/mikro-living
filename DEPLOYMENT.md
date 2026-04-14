# Deployment Guide

This project is prepared for production deployment with Docker Compose:

- `api`: Express + Sequelize + MySQL API
- `web`: Next.js frontend in standalone mode
- `db`: MySQL 8 container
- API startup waits for MySQL, then runs migrations automatically by default
- Optional managed-database override for cloud MySQL deployments

## 1. Prepare environment

Copy the production template:

```bash
cp .env.production.example .env.production
```

For managed/cloud MySQL, you can start from:

```bash
cp .env.production.managed-db.example .env.production
```

Update these values before going live:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLOUDINARY_*`
- `ALLOWED_ORIGINS`

## 2. Build containers

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production build
```

If you use a managed MySQL service instead of the bundled `db` container, build with:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.managed-db.yml --env-file .env.production build
```

## 3. Start database first

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d db
```

Wait until MySQL is healthy:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

If you use a managed MySQL service, skip this step and set these values in `.env.production` instead:

- `DB_HOST` to your managed MySQL hostname
- `DB_PORT` to the managed MySQL port
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `AUTO_RUN_MIGRATIONS=true` if you want the API container to migrate on boot

A managed-db starter template is available at [.env.production.managed-db.example](E:\xampp\htdocs\mikro-living\.env.production.managed-db.example).

## 4. Start application stack

The API container now waits for MySQL and runs migrations automatically on boot.

If this is a fresh environment and you want starter content:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm api node src/config/seed.js
```

Then start the full stack:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

For managed MySQL, use:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.managed-db.yml --env-file .env.production up -d api web
```

Default exposed ports:

- Frontend: `3000`
- API: `5000`
- MySQL: `3306`

If you prefer to manage migrations manually, set:

```env
AUTO_RUN_MIGRATIONS=false
```

and run:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm api node src/config/migrate.js
```

For managed MySQL, run the same command with the override file:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.managed-db.yml --env-file .env.production run --rm api node src/config/migrate.js
```

## 5. Verify

Check containers:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Managed MySQL mode:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.managed-db.yml --env-file .env.production ps
```

Check API health:

```bash
curl http://localhost:5000/api/v1/health
```

Open frontend:

```bash
http://localhost:3000
```

## 6. Reverse proxy

Recommended production routing for the current MikroLiving setup:

- `https://mikroliving.id` -> frontend container on port `3000`
- `https://mikroliving.id/api/v1` -> API container on port `5000`

Then set:

- `NEXT_PUBLIC_SITE_URL=https://mikroliving.id`
- `NEXT_PUBLIC_API_URL=https://mikroliving.id/api/v1`
- `ALLOWED_ORIGINS=https://mikroliving.id,https://www.mikroliving.id`

If the public website stays on Hostinger hPanel/Node.js hosting and the live backend runs elsewhere, also set:

- `API_PROXY_TARGET=https://your-live-backend.example.com/api/v1`

With that env in place, the Next.js app will proxy `https://mikroliving.id/api/v1/*` through the app server to the live backend target.

A ready-to-adapt Nginx example is included at [mikroliving.id.conf](/D:/Cece%20Abdurahman/Bisnis/Interior/mikro-living/mikro-living/deploy/nginx/mikroliving.id.conf:1). Replace:

- `mikroliving.id` only if you intentionally use a different domain
- Let’s Encrypt certificate paths with your issued cert paths
- upstream host/ports if you proxy to a different machine

Suggested server layout:

- Nginx on the host
- Docker Compose stack exposing `3000` and `5000` locally
- SSL terminated at Nginx

Hostinger quick install after the repo is on the VPS:

```bash
cd /path/to/mikroliving
chmod +x deploy/nginx/install-mikroliving-nginx.sh
./deploy/nginx/install-mikroliving-nginx.sh "$(pwd)"
```

If `nginx -t` reports a duplicate `server_name` for `mikroliving.id`, disable the older site config first, then rerun the script.

## 6a. Same-domain path on Hostinger Node.js hosting

If `mikroliving.id` is currently served by Hostinger hPanel and not by your VPS, keep the public API URL on the main domain and configure the backend target in the Node.js app instead:

```env
NEXT_PUBLIC_API_URL=https://mikroliving.id/api/v1
API_PROXY_TARGET=https://your-live-backend.example.com/api/v1
```

After redeploying the Node.js app, verify:

```bash
curl -I https://mikroliving.id/api/v1/health
curl -I https://mikroliving.id/api/v1/projects
```

## 7. Healthchecks

Production compose now includes healthchecks for:

- `db`: MySQL readiness
- `api`: `GET /api/v1/health`
- `web`: `GET /`

This lets Compose wait for the API before marking the frontend dependency chain healthy.

## 8. Updates

Redeploy after pulling new code:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Managed MySQL mode:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.managed-db.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml -f docker-compose.prod.managed-db.yml --env-file .env.production up -d api web
```

## 9. GitHub Actions -> Hostinger VPS

This repo now includes an SSH-based production deploy workflow at [.github/workflows/deploy-hostinger.yml](D:\Cece Abdurahman\Bisnis\Interior\mikro-living\mikro-living\.github\workflows\deploy-hostinger.yml).

Trigger:

- Automatic on push to `main`
- Manual from the Actions tab with `workflow_dispatch`

Required GitHub repository secrets:

- `HOSTINGER_SSH_HOST`: VPS hostname or IP
- `HOSTINGER_SSH_PORT`: usually `22`
- `HOSTINGER_SSH_USER`: SSH user on the VPS
- `HOSTINGER_SSH_PRIVATE_KEY`: private key matching the public key installed on the VPS
- `HOSTINGER_DEPLOY_PATH`: absolute path to the cloned repo on the server

Optional GitHub repository variables:

- `HOSTINGER_COMPOSE_FILES`: defaults to `-f docker-compose.prod.yml`
- `HOSTINGER_ENV_FILE`: defaults to `.env.production`

Example values:

```text
HOSTINGER_COMPOSE_FILES=-f docker-compose.prod.yml -f docker-compose.prod.managed-db.yml
HOSTINGER_ENV_FILE=.env.production
```

Server expectations:

- The repo is already cloned on the VPS at `HOSTINGER_DEPLOY_PATH`
- Docker and Docker Compose are installed on the VPS
- The production env file already exists on the server
- If `AUTO_RUN_MIGRATIONS=true`, migrations run when the `api` container starts
- The checked-out branch includes the actual application source directories such as `src/`, `scripts/`, and `app/` or `pages/`

The workflow runs these steps on the server:

```bash
git fetch origin <branch>
git checkout <branch>
git pull --ff-only origin <branch>
docker compose ... --env-file .env.production build
docker compose ... --env-file .env.production up -d
docker image prune -f
```

Before opening the SSH session, the workflow also validates that the repository contains the expected frontend and backend source tree. This prevents a server-side deploy attempt when the branch only contains infra/docs files.

## Notes

- Frontend uses Next.js `standalone` output for smaller production runtime.
- Uploaded local files go to the `api_uploads` Docker volume, but production image handling is expected to use Cloudinary.
- If you use an external managed MySQL instead of the included `db` service, use [docker-compose.prod.managed-db.yml](E:\xampp\htdocs\mikro-living\docker-compose.prod.managed-db.yml) and point `DB_HOST` to your managed database.
- The example `DB_NAME=mikro-living.db` is kept from the provided credentials, but many MySQL setups use schema names like `mikro_living`; verify the exact database name with your provider before going live.
- For zero-downtime-sensitive deployments, consider disabling auto migrations and running them explicitly in your release pipeline before switching traffic.

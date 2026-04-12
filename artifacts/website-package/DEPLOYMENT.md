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

Recommended production routing:

- `https://your-domain.com` -> frontend container on port `3000`
- `https://your-domain.com/api/v1` -> API container on port `5000`

If you use a reverse proxy on the same domain, set:

- `NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1`
- `ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com`

A ready-to-adapt Nginx example is included at [deploy/nginx/mikroliving.conf](E:\xampp\htdocs\mikro-living\deploy\nginx\mikroliving.conf). Replace:

- `your-domain.com` with your real domain
- Let’s Encrypt certificate paths with your issued cert paths
- upstream host/ports if you proxy to a different machine

Suggested server layout:

- Nginx on the host
- Docker Compose stack exposing `3000` and `5000` locally
- SSL terminated at Nginx

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

## Notes

- Frontend uses Next.js `standalone` output for smaller production runtime.
- Uploaded local files go to the `api_uploads` Docker volume, but production image handling is expected to use Cloudinary.
- If you use an external managed MySQL instead of the included `db` service, use [docker-compose.prod.managed-db.yml](E:\xampp\htdocs\mikro-living\docker-compose.prod.managed-db.yml) and point `DB_HOST` to your managed database.
- The example `DB_NAME=mikro-living.db` is kept from the provided credentials, but many MySQL setups use schema names like `mikro_living`; verify the exact database name with your provider before going live.
- For zero-downtime-sensitive deployments, consider disabling auto migrations and running them explicitly in your release pipeline before switching traffic.

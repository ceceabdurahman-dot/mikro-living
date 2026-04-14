# 🏠 MikroLiving — Full Stack Documentation

> Interior Design Studio Website — Next.js + Node.js + MySQL + Cloudinary

---

## 📁 Struktur Monorepo

```
mikroliving-workspace/
├── mikroliving/              # Frontend — Next.js 14
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/           # 14 komponen React
│   ├── lib/
│   │   └── api.ts            # API client
│   ├── vercel.json
│   └── package.json
│
└── mikroliving-backend/      # Backend — Node.js + Express
    ├── src/
    │   ├── index.js          # Entry point
    │   ├── config/
    │   │   ├── database.js   # Sequelize + MySQL
    │   │   ├── cloudinary.js # Image CDN config
    │   │   ├── migrate.js    # DDL migration
    │   │   └── seed.js       # Initial data
    │   ├── models/
    │   │   └── index.js      # 8 Sequelize models
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── projectController.js
    │   │   ├── blogController.js
    │   │   ├── serviceController.js
    │   │   └── cmsControllers.js
    │   ├── routes/
    │   │   └── index.js      # Semua route terdaftar
    │   ├── middleware/
    │   │   ├── auth.js       # JWT middleware
    │   │   └── errorHandler.js
    │   └── utils/
    │       ├── logger.js     # Winston logger
    │       └── apiResponse.js
    ├── .env.example
    └── package.json
```

---

## 🗄️ Database Schema (MySQL)

```
users               → Admin CMS (superadmin / admin / editor)
projects            → Portfolio proyek (dengan cover image)
project_images      → Galeri foto per proyek
services            → Layanan MikroLiving
blog_posts          → Artikel / Insights
testimonials        → Review klien
team_members        → Profil tim
consultation_requests → Lead / form konsultasi
site_settings       → Konfigurasi CMS global (key-value)
```

---

## ⚡ Quick Start

### Prasyarat

| Tool      | Versi Minimum |
|-----------|---------------|
| Node.js   | 18.x          |
| MySQL     | 8.x           |
| npm       | 9.x           |

---

### 1. Setup Database MySQL

```sql
-- Buka MySQL client Anda (TablePlus / DBeaver / terminal)
CREATE DATABASE mikroliving_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mikroliving'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON mikroliving_db.* TO 'mikroliving'@'localhost';
FLUSH PRIVILEGES;
```

---

### 2. Setup Backend

```bash
cd mikroliving-backend

# Install dependencies
npm install

# Salin dan isi environment variables
cp .env.example .env
nano .env   # atau buka dengan editor favorit Anda
```

Isi file `.env`:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mikroliving_db
DB_USER=mikroliving
DB_PASSWORD=yourpassword
JWT_SECRET=ganti-dengan-string-acak-min-32-karakter
JWT_REFRESH_SECRET=ganti-dengan-string-acak-lainnya
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=admin@mikroliving.id
ADMIN_PASSWORD=Admin@Mikro2024!
ALLOWED_ORIGINS=http://localhost:3000
```

```bash
# Jalankan migrasi (buat tabel)
npm run db:migrate

# Isi data awal (admin, services, settings)
npm run db:seed

# Jalankan development server
npm run dev
# → Backend running di http://localhost:5000
```

---

### 3. Setup Frontend

```bash
cd mikroliving

# Install dependencies
npm install

# Buat .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EOF

# Jalankan dev server
npm run dev
# → Frontend running di http://localhost:3000
```

---

## 🌐 API Reference

Base URL: `http://localhost:5000/api/v1`

### Authentication

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/auth/login` | ❌ | Login admin |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout |
| GET | `/auth/me` | ✅ | Info user aktif |
| PUT | `/auth/change-password` | ✅ | Ganti password |
| POST | `/auth/users` | ✅ Superadmin | Buat admin baru |

### Projects (Portfolio)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/projects` | ❌ | List semua proyek |
| GET | `/projects/:slug` | ❌ | Detail proyek |
| POST | `/projects` | ✅ Admin | Buat proyek baru |
| PUT | `/projects/:id` | ✅ Admin | Update proyek |
| DELETE | `/projects/:id` | ✅ Admin | Hapus proyek |
| PATCH | `/projects/:id/featured` | ✅ Admin | Toggle featured |
| POST | `/projects/:id/images` | ✅ Admin | Upload galeri (max 20 foto) |
| DELETE | `/projects/images/:imageId` | ✅ Admin | Hapus foto galeri |

Query params GET `/projects`:
- `?page=1&limit=12` — pagination
- `?category=apartment` — filter kategori
- `?featured=true` — hanya proyek unggulan
- `?q=botanica` — pencarian judul

### Blog / Insights

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/blog` | ❌ | List artikel |
| GET | `/blog/:slug` | ❌ | Detail artikel |
| POST | `/blog` | ✅ Admin | Buat artikel |
| PUT | `/blog/:id` | ✅ Admin | Update artikel |
| DELETE | `/blog/:id` | ✅ Admin | Hapus artikel |

### Services, Testimonials, Team

```
GET    /services              → List layanan (publik)
POST   /services              → Buat layanan (admin)
PUT    /services/:id          → Update (admin)
DELETE /services/:id          → Hapus (admin)

GET    /testimonials          → List testimonial (publik)
GET    /testimonials?featured=true → Hanya featured
POST   /testimonials          → Tambah (admin)
PUT    /testimonials/:id      → Update (admin)

GET    /team                  → List tim (publik)
POST   /team                  → Tambah anggota (admin)
PUT    /team/:id              → Update (admin)
DELETE /team/:id              → Hapus (admin)
```

### Consultations (Lead Form)

```
POST   /consultations         → Submit form (publik, dari website)
GET    /consultations         → List semua lead (admin)
PATCH  /consultations/:id     → Update status lead (admin)
```

Status lead: `new` → `contacted` → `in_progress` → `converted` / `closed`

### Settings CMS

```
GET    /settings              → Semua settings (admin, grouped)
GET    /settings/:key         → Nilai setting spesifik (publik)
PUT    /settings/:key         → Upsert satu setting (admin)
PUT    /settings              → Bulk update (admin, kirim { settings: { key: value } })
```

### Dashboard

```
GET    /dashboard/stats       → Statistik ringkasan (admin)
```

---

## 📸 Cloudinary — Manajemen Gambar

Setiap tipe konten di-upload ke folder Cloudinary yang berbeda dengan transformasi otomatis:

| Folder | Transformasi | Digunakan untuk |
|--------|-------------|-----------------|
| `mikroliving/projects` | 1920px, WebP auto | Foto hero portfolio |
| `mikroliving/thumbnails` | 800×600 crop, eco | Card thumbnail |
| `mikroliving/avatars` | 400×400 face-crop | Foto tim & klien |
| `mikroliving/blog` | 1200px, WebP auto | Cover artikel |
| `mikroliving/logos` | 400px, best quality | Icon layanan |

Gambar yang dihapus dari database juga otomatis terhapus dari Cloudinary.

---

## 🚀 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

cd mikroliving
vercel login

# Deploy (ikuti wizard)
vercel

# Set environment variables di Vercel Dashboard:
# NEXT_PUBLIC_API_URL  = https://mikroliving.id/api/v1
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = your_cloud_name
```

### Backend → VPS / Railway / Render

**Opsi A — Railway (mudah)**
```bash
# Install Railway CLI
npm install -g @railway/cli

cd mikroliving-backend
railway login
railway init
railway up

# Set semua env vars via Railway Dashboard
# Tambahkan plugin MySQL di Railway
```

**Opsi B — VPS Ubuntu dengan PM2**
```bash
# Di server
git clone https://github.com/youruser/mikroliving-backend
cd mikroliving-backend
npm install --production
cp .env.example .env && nano .env

# Migrasi & seed
npm run db:migrate
npm run db:seed

# Install PM2 process manager
npm install -g pm2
pm2 start src/index.js --name "mikroliving-api"
pm2 startup
pm2 save

# Nginx reverse proxy
# Arahkan mikroliving.id/api/v1/ ke localhost:5000
```

**Nginx config contoh:**
```nginx
server {
    listen 80;
    server_name mikroliving.id;

    location /api/v1/ {
        proxy_pass http://localhost:5000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 20M;
}
```

---

## 🎨 CMS — Cara Pakai

### Login ke CMS

Setelah seed, login menggunakan:
- **Email:** `admin@mikroliving.id`
- **Password:** `Admin@Mikro2024!`

### Endpoint login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mikroliving.id","password":"Admin@Mikro2024!"}'
```

Response: `{ "data": { "accessToken": "eyJ..." } }`

### Upload Proyek Baru:
```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Studio Kemang" \
  -F "category=apartment" \
  -F "location=Jakarta Selatan" \
  -F "area_sqm=38" \
  -F "status=published" \
  -F "cover=@/path/to/cover.jpg"
```

### Update Setting Situs:
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"settings": {"stat_projects": "155+", "contact_phone": "+62 812-9999-0000"}}'
```

---

## 🔐 Role & Permissions

| Aksi | Superadmin | Admin | Editor |
|------|-----------|-------|--------|
| Buat / hapus user | ✅ | ❌ | ❌ |
| Manage proyek | ✅ | ✅ | ❌ |
| Manage blog | ✅ | ✅ | ✅ |
| Manage settings | ✅ | ✅ | ❌ |
| Lihat leads | ✅ | ✅ | ❌ |
| Update status lead | ✅ | ✅ | ❌ |

---

## 🛠️ Tech Stack Lengkap

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animasi | Framer Motion + GSAP |
| Backend | Node.js + Express |
| Database | MySQL 8 + Sequelize ORM |
| Auth | JWT (Access + Refresh Token) |
| Image CDN | Cloudinary |
| File Upload | Multer + multer-storage-cloudinary |
| Logging | Winston |
| Security | Helmet + CORS + Rate Limiting |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway / VPS + PM2 + Nginx |

---

## 📞 Figma Design Workflow

Untuk workflow desain sebelum coding:
1. **Buat project** di Figma: `mikroliving-design`
2. **Gunakan komponen** yang sudah ada di file ZIP sebagai referensi layout
3. **Color tokens** (tambahkan ke Figma Variables):
   - `primary` → `#785600`
   - `primary-fixed` → `#ffdea6`
   - `primary-fixed-dim` → `#f7bd48`
   - `background` → `#fbf9f6`
   - `on-surface` → `#1b1c1a`
4. **Font**: Noto Serif (heading) + Manrope (body)
5. Export design tokens → paste ke `tailwind.config.ts`

---

*© 2024 MikroLiving Interior Studio — All rights reserved*

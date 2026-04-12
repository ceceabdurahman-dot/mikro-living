# Checklist cPanel + Node.js App

Gunakan checklist ini jika hosting cPanel Anda punya menu `Setup Node.js App`.

## 1. Upload file

- Upload `mikroliving-website-2026-03-28.zip` ke folder app, misalnya `~/mikroliving`
- Extract ZIP
- Upload `mikroliving-database-2026-03-28.sql`

## 2. Database

- Buka `MySQL Databases`
- Buat database baru
- Buat user database baru
- Assign user ke database dengan `ALL PRIVILEGES`
- Buka `phpMyAdmin`
- Import file `.sql`

## 3. Setup Node.js App

- Buka `Setup Node.js App`
- Create Application
- Node.js version: `20.x` atau versi tertinggi yang tersedia
- Application mode: `Production`
- Application root: folder project, misalnya `mikroliving`
- Application URL: pilih domain atau subdomain tujuan
- Application startup file: `src/index.js`

Catatan:
- Jika cPanel Anda hanya mengizinkan satu startup file untuk satu app, lebih aman pisahkan backend dan frontend ke subdomain berbeda, atau gunakan VPS.
- Untuk stack ini, skenario cPanel paling aman biasanya:
  - `api.domainanda.com` untuk backend Node.js
  - frontend dibuild statis atau diproxy lewat setup hosting yang mendukung Next.js runtime

## 4. Environment variables

Masukkan variable berikut di panel Node.js App atau file `.env.production`:

- `NODE_ENV=production`
- `PORT=5000`
- `API_PREFIX=/api/v1`
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_NAME=cpanel_db_name`
- `DB_USER=cpanel_db_user`
- `DB_PASSWORD=cpanel_db_password`
- `JWT_SECRET=ganti_dengan_secret_panjang`
- `ALLOWED_ORIGINS=https://domainanda.com,https://www.domainanda.com`
- `CLOUDINARY_CLOUD_NAME=`
- `CLOUDINARY_API_KEY=`
- `CLOUDINARY_API_SECRET=`

Frontend public env jika dipakai:
- `NEXT_PUBLIC_API_URL=https://domainanda.com/api/v1`
- `NEXT_PUBLIC_SITE_URL=https://domainanda.com`

## 5. Install dependency

Buka `Terminal` di cPanel lalu jalankan:

```bash
cd ~/mikroliving
npm install
npm run build:web
```

## 6. Jalankan / restart app

- Klik `Restart` di `Setup Node.js App`
- Atau jika terminal diizinkan, jalankan ulang proses sesuai konfigurasi hosting

## 7. Verifikasi

- Homepage tampil
- `/login` tampil
- `/cms` redirect/login normal
- `/api/v1/health` mengembalikan 200
- Login admin berhasil
- Upload gambar berhasil

## 8. Catatan penting

- Banyak shared hosting cPanel tidak ideal untuk Next.js full runtime + backend API dalam satu stack
- Jika frontend Next.js tidak bisa berjalan stabil di cPanel, gunakan VPS Ubuntu + Nginx + PM2 atau Docker VPS

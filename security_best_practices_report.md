# Security Best Practices Report

Date: 2026-04-05

## Executive Summary

Saya menemukan dua risiko utama yang masih perlu ditangani lanjut:

1. Token akses admin masih disimpan di cookie yang bisa dibaca JavaScript, jadi jika ada XSS di area admin/public yang lolos, token bisa dicuri.
2. Dependency audit masih melaporkan advisory aktif pada beberapa paket inti (`cloudinary`, `multer-storage-cloudinary`, `next`, `path-to-regexp`, `lodash`).

Dalam pass ini saya juga langsung memperbaiki beberapa isu nyata:

- `/admin` sekarang menjadi redirect server-side HTTP `307` ke `/cms` dengan `Location: /cms`.
- Parameter `redirect` di login sekarang dibatasi hanya ke path internal.
- Konten HTML artikel sekarang disanitasi sebelum dirender ke publik.
- Header `X-Powered-By` pada API Express sudah dimatikan.

## High Severity

### SEC-001: Access token admin masih disimpan di cookie yang dapat dibaca JavaScript

- Severity: High
- Location:
  - [app/login/page.tsx](E:\xampp\htdocs\mikro-living\app\login\page.tsx):11
  - [app/login/page.tsx](E:\xampp\htdocs\mikro-living\app\login\page.tsx):34
  - [app/login/page.tsx](E:\xampp\htdocs\mikro-living\app\login\page.tsx):77
  - [app/cms/page.tsx](E:\xampp\htdocs\mikro-living\app\cms\page.tsx):360
  - [app/cms/page.tsx](E:\xampp\htdocs\mikro-living\app\cms\page.tsx):368
- Evidence:
  - Login menulis `ml_access_token` langsung melalui `document.cookie`.
  - CMS membaca token yang sama dari `document.cookie` lalu memakainya sebagai bearer token.
- Impact:
  - Jika ada XSS yang berhasil masuk ke halaman login, CMS, atau halaman lain yang berbagi origin, attacker bisa mencuri token admin dan mengambil alih sesi.
- Fix:
  - Pindahkan session handling ke cookie `HttpOnly` yang diset server-side.
  - Hindari membaca bearer token dari JavaScript browser.
- Mitigation:
  - Karena saya sudah menutup jalur stored XSS blog publik di pass ini, blast radius berkurang, tetapi risiko inti tetap ada sampai alur auth dipindah ke `HttpOnly` cookie.

### SEC-002: Audit dependency masih menunjukkan advisory aktif pada paket inti

- Severity: High
- Location:
  - [package.json](E:\xampp\htdocs\mikro-living\package.json):29
  - [package.json](E:\xampp\htdocs\mikro-living\package.json):33
  - [package.json](E:\xampp\htdocs\mikro-living\package.json):45
  - [package.json](E:\xampp\htdocs\mikro-living\package.json):47
- Evidence:
  - `npm.cmd audit --omit=dev --json` pada 2026-04-05 melaporkan 5 vulnerability (`5 high`).
  - Paket yang terdampak: `cloudinary`, `multer-storage-cloudinary`, `next`, `path-to-regexp`, `lodash`.
- Impact:
  - Risiko residual mencakup argument injection, DoS, dan ReDoS dari dependency line yang masih dipakai project.
- Fix:
  - Buat upgrade plan terpisah untuk:
    - `cloudinary` + `multer-storage-cloudinary`
    - `express` dependency chain yang membawa `path-to-regexp`
    - `next` ke line yang sudah bebas advisory menurut audit target saat ini
- False positive notes:
  - Ini temuan dependency posture, bukan bukti eksploit aktif di runtime lokal.
  - Upgrade mayor perlu diuji karena berpotensi memengaruhi upload media dan build Next.

## Fixed In This Pass

### SEC-FIX-001: `/admin` sekarang redirect server-side dan tetap satu host

- Location:
  - [next.config.js](E:\xampp\htdocs\mikro-living\next.config.js):7
- Result:
  - `GET /admin` sekarang menghasilkan `307` dengan `Location: /cms`.

### SEC-FIX-002: Redirect login sekarang hanya menerima path internal

- Location:
  - [app/login/page.tsx](E:\xampp\htdocs\mikro-living\app\login\page.tsx):26
  - [lib/safeRedirect.ts](E:\xampp\htdocs\mikro-living\lib\safeRedirect.ts):1
- Result:
  - Query seperti `?redirect=https://evil.example` sekarang disanitasi dan tidak dipakai untuk navigation target.

### SEC-FIX-003: Stored XSS di halaman artikel publik ditutup dengan sanitizer

- Location:
  - [app/blog/[slug]/page.tsx](E:\xampp\htdocs\mikro-living\app\blog\[slug]\page.tsx):5
  - [app/blog/[slug]/page.tsx](E:\xampp\htdocs\mikro-living\app\blog\[slug]\page.tsx):18
  - [app/blog/[slug]/page.tsx](E:\xampp\htdocs\mikro-living\app\blog\[slug]\page.tsx):54
  - [lib/sanitizeHtml.ts](E:\xampp\htdocs\mikro-living\lib\sanitizeHtml.ts):1
- Result:
  - Konten artikel sekarang disaring dengan allowlist tag/atribut aman sebelum masuk ke `dangerouslySetInnerHTML`.

### SEC-FIX-004: Header fingerprinting backend dan frontend dikurangi

- Location:
  - [src/index.js](E:\xampp\htdocs\mikro-living\src\index.js):21
  - [next.config.js](E:\xampp\htdocs\mikro-living\next.config.js):4
- Result:
  - API tidak lagi mengirim `X-Powered-By: Express`.
  - Frontend Next juga tidak lagi mengirim `X-Powered-By: Next.js`.

## Verification

- `npm.cmd run build:web` sukses setelah perubahan redirect dan sanitizer.
- `GET http://127.0.0.1:3001/admin` -> `307` dengan `Location: /cms`.
- `GET http://127.0.0.1:5000/api/v1/health` -> `200`.
- Build output `.next/server/app/blog/[slug]/page.js` memuat konfigurasi sanitizer yang baru, jadi fix artikel publik benar-benar ikut terbundle.
